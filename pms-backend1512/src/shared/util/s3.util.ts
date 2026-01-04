import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Util {
  private s3: S3Client;
  private bucketName: string = process.env.AWS_BUCKET_NAME;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(buffer: Buffer, key: string, mimetype: string): Promise<string> {
    const uploadParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    };

    try {
      await this.s3.send(new PutObjectCommand(uploadParams));
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      if (error.name === "CredentialsError") {
        throw new Error("AWS credentials are invalid or missing.");
      } else if (error.name === "NoSuchBucket") {
        throw new Error("The specified bucket does not exist.");
      } else {
        throw new Error("Failed to upload file to S3.");
      }
    }
  }
  async generatePresignedUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: 'mpsprofilesbiz/'+fileKey,
    });

    // Generate a pre-signed URL that expires in 1 hour
    const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    return url;
  }
}
