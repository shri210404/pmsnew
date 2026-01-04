import { BadRequestException, Injectable } from '@nestjs/common';
import FileType from 'file-type';
import { v4 as uuidv4 } from 'uuid';
import { AppLogger } from './applogger.service';

export enum UploadType {
  PROPOSAL = 'proposal',
  JOB_ORDER = 'job-order',
  FUTURE_JOB = 'future-job',
  RESUME = 'resume',
  JD = 'jd',
}

// Allowed MIME types per upload type
const ALLOWED_MIME_TYPES: Record<UploadType, string[]> = {
  [UploadType.PROPOSAL]: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'image/jpeg',
    'image/png',
    'image/jpg',
  ],
  [UploadType.JOB_ORDER]: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'text/plain',
  ],
  [UploadType.FUTURE_JOB]: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'image/jpeg',
    'image/png',
    'image/jpg',
  ],
  [UploadType.RESUME]: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  ],
  [UploadType.JD]: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'text/plain',
  ],
};

// File size limits per upload type (in bytes)
const FILE_SIZE_LIMITS: Record<UploadType, number> = {
  [UploadType.PROPOSAL]: 5 * 1024 * 1024, // 5MB
  [UploadType.JOB_ORDER]: 2 * 1024 * 1024, // 2MB
  [UploadType.FUTURE_JOB]: 5 * 1024 * 1024, // 5MB
  [UploadType.RESUME]: 10 * 1024 * 1024, // 10MB
  [UploadType.JD]: 2 * 1024 * 1024, // 2MB
};

// Dangerous file extensions to reject
const DANGEROUS_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.com',
  '.pif',
  '.scr',
  '.vbs',
  '.js',
  '.jar',
  '.app',
  '.deb',
  '.pkg',
  '.rpm',
  '.sh',
  '.ps1',
  '.dll',
  '.sys',
  '.dmg',
  '.iso',
];

// MIME type to extension mapping for validation
const MIME_TO_EXTENSION: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/jpg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'text/plain': ['.txt'],
};

export interface FileValidationResult {
  isValid: boolean;
  sanitizedFilename: string;
  detectedMimeType?: string;
  error?: string;
}

@Injectable()
export class FileValidator {
  private readonly logContext = 'FileValidator';

  constructor(private readonly logger: AppLogger) {}

  /**
   * Validate and sanitize file
   * @param fileBuffer - File buffer
   * @param originalFilename - Original filename from upload
   * @param declaredMimeType - MIME type declared by client
   * @param uploadType - Type of upload (proposal, job-order, etc.)
   * @returns Validation result with sanitized filename
   */
  async validateFile(
    
    buffer: Buffer,
    //fileBuffer: buffer,
    originalFilename: string,
    declaredMimeType: string,
    uploadType: UploadType,
  ): Promise<FileValidationResult> {

    let detectedMimeType = '';

    try {
      // 1. Check file size
      const sizeLimit = FILE_SIZE_LIMITS[uploadType];
      if (buffer.length > sizeLimit) {
        return {
          isValid: false,
          sanitizedFilename: '',
          error: `File size exceeds limit of ${sizeLimit / (1024 * 1024)}MB for ${uploadType} uploads`,
        };
      }

      // 2. Detect actual file type from buffer
      const type = await FileType.fromBuffer(buffer);
      
      //const detectedMimeType = fileTypeResult?.mime;

      if (!detectedMimeType) {
        return {
          isValid: false,
          sanitizedFilename: '',
          error: 'Unable to detect file type. File may be corrupted or invalid.',
        };
      }

      // 3. Validate MIME type against whitelist
      const allowedMimeTypes = ALLOWED_MIME_TYPES[uploadType];
      if (!allowedMimeTypes.includes(detectedMimeType)) {
        this.logger.warn(
          `Rejected file with MIME type ${detectedMimeType} for ${uploadType} upload`,
          this.logContext,
        );
        return {
          isValid: false,
          sanitizedFilename: '',
          detectedMimeType,
          error: `File type ${detectedMimeType} is not allowed for ${uploadType} uploads`,
        };
      }

      // 4. Verify declared MIME type matches detected type (prevent MIME type spoofing)
      if (declaredMimeType && declaredMimeType !== detectedMimeType) {
        this.logger.warn(
          `MIME type mismatch: declared ${declaredMimeType}, detected ${detectedMimeType}`,
          this.logContext,
        );
        // Use detected type, but log the mismatch
      }

      // 5. Extract and validate file extension
      const originalExtension = this.extractExtension(originalFilename);
      if (!originalExtension) {
        return {
          isValid: false,
          sanitizedFilename: '',
          detectedMimeType,
          error: 'File must have a valid extension',
        };
      }

      // 6. Check for dangerous extensions
      if (DANGEROUS_EXTENSIONS.includes(originalExtension.toLowerCase())) {
        this.logger.warn(
          `Rejected dangerous file extension: ${originalExtension}`,
          this.logContext,
        );
        return {
          isValid: false,
          sanitizedFilename: '',
          detectedMimeType,
          error: `File extension ${originalExtension} is not allowed for security reasons`,
        };
      }

      // 7. Verify extension matches MIME type
      const expectedExtensions = MIME_TO_EXTENSION[detectedMimeType] || [];
      if (expectedExtensions.length > 0 && !expectedExtensions.includes(originalExtension.toLowerCase())) {
        this.logger.warn(
          `Extension mismatch: ${originalExtension} does not match MIME type ${detectedMimeType}`,
          this.logContext,
        );
        // Use the correct extension based on detected MIME type
        const correctExtension = expectedExtensions[0];
        const sanitizedFilename = this.sanitizeFilename(originalFilename, correctExtension);
        return {
          isValid: true,
          sanitizedFilename,
          detectedMimeType,
        };
      }

      // 8. Sanitize filename
      const sanitizedFilename = this.sanitizeFilename(originalFilename, originalExtension);

      // 9. Basic content validation
      const contentValidation = await this.validateContent(buffer, detectedMimeType);
      if (!contentValidation.isValid) {
        return {
          isValid: false,
          sanitizedFilename: '',
          detectedMimeType,
          error: contentValidation.error,
        };
      }

      return {
        isValid: true,
        sanitizedFilename,
        detectedMimeType,
      };
    } catch (error) {
      this.logger.error(`File validation error: ${error.message}`, this.logContext);
      return {
        isValid: false,
        sanitizedFilename: '',
        error: 'File validation failed: ' + error.message,
      };
    }
  }

  /**
   * Sanitize filename: remove path separators, special characters, limit length
   * Returns: UUID + sanitized extension
   */
  private sanitizeFilename(originalFilename: string, extension: string): string {
    // Remove path separators and dangerous characters
    let sanitized = originalFilename
      .replace(/[/\\]/g, '') // Remove path separators
      .replace(/[^a-zA-Z0-9._-]/g, '') // Keep only alphanumeric, dots, dashes, underscores
      .replace(/\.\./g, '') // Remove double dots (path traversal)
      .trim();

    // Limit filename length (excluding extension)
    const maxLength = 200; // Leave room for UUID and extension
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // Remove extension from original and use provided extension
    const nameWithoutExt = sanitized.replace(/\.[^.]*$/, '');
    
    // Generate UUID-based filename with sanitized extension
    const uuid = uuidv4();
    const sanitizedExtension = extension.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    
    return `${uuid}.${sanitizedExtension}`;
  }

  /**
   * Extract file extension from filename
   */
  private extractExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1 || lastDot === filename.length - 1) {
      return '';
    }
    return filename.substring(lastDot).toLowerCase();
  }

  /**
   * Basic content structure validation
   */
  private async validateContent(
    buffer: Buffer,
    mimeType: string,
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      // PDF validation: Check for PDF header
      if (mimeType === 'application/pdf') {
        const pdfHeader = buffer.slice(0, 4).toString();
        if (pdfHeader !== '%PDF') {
          return {
            isValid: false,
            error: 'Invalid PDF file structure',
          };
        }
      }

      // Image validation: Check for image magic bytes
      if (mimeType.startsWith('image/')) {
        const imageHeaders = {
          'image/jpeg': [0xff, 0xd8, 0xff],
          'image/png': [0x89, 0x50, 0x4e, 0x47],
        };

        const expectedHeader = imageHeaders[mimeType as keyof typeof imageHeaders];
        if (expectedHeader) {
          const matches = expectedHeader.every(
            (byte, index) => buffer[index] === byte,
          );
          if (!matches) {
            return {
              isValid: false,
              error: `Invalid ${mimeType} file structure`,
            };
          }
        }
      }

      // DOCX validation: Check for ZIP header (DOCX is a ZIP archive)
      if (
        mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const zipHeader = buffer.slice(0, 2);
        if (zipHeader[0] !== 0x50 || zipHeader[1] !== 0x4b) {
          // PK (ZIP signature)
          return {
            isValid: false,
            error: 'Invalid DOCX file structure',
          };
        }
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: 'Content validation failed: ' + error.message,
      };
    }
  }

  /**
   * Get file size limit for a specific upload type
   */
  getFileSizeLimit(uploadType: UploadType): number {
    return FILE_SIZE_LIMITS[uploadType];
  }

  /**
   * Get allowed MIME types for a specific upload type
   */
  getAllowedMimeTypes(uploadType: UploadType): string[] {
    return ALLOWED_MIME_TYPES[uploadType];
  }
}

