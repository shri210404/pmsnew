import { writeFileSync } from "node:fs";

import { BadRequestException, Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { S3Util } from "./s3.util";
import { FileValidator, UploadType } from "./file-validator.util";
import { AppLogger } from "./applogger.service";

@Injectable()
export class FileUtil {
  constructor(
    private readonly s3Util: S3Util,
    private readonly fileValidator: FileValidator,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Save file with validation and sanitization
   * @param fileDetails - File details from multipart upload
   * @param uploadType - Type of upload (proposal, job-order, etc.)
   * @param originalFilename - Optional: store original filename for reference
   * @returns S3 file URL
   */
  async saveFile(
    fileDetails: any,
    uploadType: UploadType = UploadType.PROPOSAL,
  ): Promise<string> {
    const buff = await fileDetails.toBuffer();
    const originalFilename = fileDetails.filename || 'unknown';
    const declaredMimeType = fileDetails.mimetype;

    // Validate file
    const validationResult = await this.fileValidator.validateFile(
      buff,
      originalFilename,
      declaredMimeType,
      uploadType,
    );

    if (!validationResult.isValid) {
      this.logger.error(
        `File validation failed: ${validationResult.error}`,
        'FileUtil',
      );
      throw new BadRequestException(
        validationResult.error || 'File validation failed',
      );
    }

    // Use sanitized filename
    const sanitizedFilename = validationResult.sanitizedFilename;
    const detectedMimeType = validationResult.detectedMimeType || declaredMimeType;

    // Prepend the folder name to the file name
    const key = `mpsprofilesbiz/${sanitizedFilename}`;

    // Upload to S3 with detected MIME type
    const fileUrl = await this.s3Util.uploadFile(buff, key, detectedMimeType);

    this.logger.log(
      `File uploaded successfully: ${sanitizedFilename} (original: ${originalFilename}, type: ${detectedMimeType})`,
      'FileUtil',
    );

    return fileUrl;
  }
}
