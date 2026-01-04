import { Injectable, Logger as BuiltInLoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createLogger, transports, format, Logger } from "winston";
import "winston-mongodb";
import { SensitiveDataMasker } from "./sensitive-data-masker.util";

@Injectable()
export class AppLogger {
  private logger: Logger;
  private logDir: string;
  private allowDbLogging: boolean;

  constructor(
    private readonly config: ConfigService,
    private readonly _logger: BuiltInLoggerService
  ) {
    this.logDir = this.config.get<string>("LOG_DIR");
    this.initializeLogger();
  }

  private initializeLogger(): void {
    const dbl = +this.config.get<string>("ALLOW_DB_LOG");
    this.allowDbLogging = Boolean(dbl);

    if (this.allowDbLogging) {
      const logMaxSize = +this.config.get<string>("LOG_MAX_SIZE");
      this.logger = createLogger({
        transports: [
          new transports.MongoDB({
            format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), format.json()),
            metaKey: "meta",
            db: this.config.get<string>("LOG_DB_URI"),
            options: {
              useUnifiedTopology: true,
            },
            dbName: this.config.get<string>("LOG_DB_NAME"),
            collection: this.config.get<string>("LOG_DB_TABLE"),
          }),
        ],
      });
      this.logger.exceptions.handle(
        new transports.File({ dirname: this.logDir, maxsize: logMaxSize, maxFiles: 10, filename: "exceptions.log" })
      );
    }
  }

  /**
   * Mask sensitive data before logging
   */
  private maskData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }
    return SensitiveDataMasker.maskSensitiveData(data);
  }

  public log(message: string, _context = "", metadata = null) {
    this.info(message, _context, metadata);
  }

  public debug(message: string, _context = "", metadata = null) {
    // Mask sensitive data before logging
    const maskedMessage = typeof message === 'string' 
      ? SensitiveDataMasker.maskString(message) 
      : message;
    const maskedMetadata = this.maskData(metadata);

    // Application server log
    this._logger.debug(maskedMessage, _context);

    // Logging to remote DB if allowed
    if (this.allowDbLogging) {
      this.logger.debug(maskedMessage, { meta: maskedMetadata });
    }
  }

  public info(message: string, _context = "", metadata = null) {
    // Mask sensitive data before logging
    const maskedMessage = typeof message === 'string' 
      ? SensitiveDataMasker.maskString(message) 
      : message;
    const maskedMetadata = this.maskData(metadata);

    // Application server log
    this._logger.log(maskedMessage, _context);

    // Logging to remote DB if allowed
    if (this.allowDbLogging) {
      this.logger.info(maskedMessage, { meta: maskedMetadata });
    }
  }

  public warn(message: string, _context = "", metadata = null) {
    // Mask sensitive data before logging
    const maskedMessage = typeof message === 'string' 
      ? SensitiveDataMasker.maskString(message) 
      : message;
    const maskedMetadata = this.maskData(metadata);

    // Application server log
    this._logger.warn(maskedMessage, _context);

    // Logging to remote DB if allowed
    if (this.allowDbLogging) {
      this.logger.warn(maskedMessage, { meta: maskedMetadata });
    }
  }

  public error(message: string, _context = "", metadata = null) {
    // Mask sensitive data before logging
    const maskedMessage = typeof message === 'string' 
      ? SensitiveDataMasker.maskString(message) 
      : message;
    const maskedMetadata = this.maskData(metadata);

    // Application server log
    this._logger.error(maskedMessage, _context);

    // Logging to remote DB if allowed
    if (this.allowDbLogging) {
      this.logger.error(maskedMessage, { meta: maskedMetadata });
    }
  }
}
