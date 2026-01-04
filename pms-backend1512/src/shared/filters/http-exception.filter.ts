import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppLogger } from '../util/applogger.service';
import { SensitiveDataMasker } from '../util/sensitive-data-masker.util';

/**
 * Global Exception Filter
 * Catches all exceptions and formats consistent error responses
 * Masks sensitive data before logging
 * Returns generic messages to clients (doesn't expose internals)
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly appLogger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    // Get correlation ID from request (set by CorrelationInterceptor)
    const correlationId = (request as any).correlationId || 'unknown';

    // Determine status code and message
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;
    let error: string;
    let details: any = null;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.constructor.name;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message || 'An error occurred';
        error = responseObj.error || exception.constructor.name;
        details = responseObj.details || null;
      } else {
        message = exception.message || 'An error occurred';
        error = exception.constructor.name;
      }
    } else if (exception instanceof Error) {
      message = 'An internal server error occurred';
      error = 'InternalServerError';
      
      // Log full error details (but mask sensitive data)
      this.logError(exception, request, correlationId, status);
    } else {
      message = 'An unexpected error occurred';
      error = 'UnknownError';
    }

    // Prepare error response (generic message for client)
    const req = request as any;
    const res = response as any;
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url || req.raw?.url || 'unknown',
      method: req.method || req.raw?.method || 'unknown',
      correlationId: correlationId,
      message: this.getClientSafeMessage(message, status),
      error: error,
      ...(details && { details: this.maskSensitiveDetails(details) }),
    };

    // Log error with correlation ID and masked sensitive data
    this.logError(exception, request, correlationId, status, message);

    // Add correlation ID to response header
    res.header('X-Correlation-ID', correlationId);

    // Send error response
    res.status(status).send(errorResponse);
  }

  /**
   * Get client-safe error message (don't expose internal details)
   */
  private getClientSafeMessage(message: string | string[], status: number): string {
    // For 5xx errors, return generic message
    if (status >= 500) {
      return 'An internal server error occurred. Please try again later.';
    }

    // For 4xx errors, return the message but ensure it's safe
    if (Array.isArray(message)) {
      return message.join(', ');
    }

    // Mask any sensitive patterns in the message
    return SensitiveDataMasker.maskString(String(message));
  }

  /**
   * Mask sensitive details in error response
   */
  private maskSensitiveDetails(details: any): any {
    return SensitiveDataMasker.maskSensitiveData(details);
  }

  /**
   * Log error with correlation ID and masked sensitive data
   */
  private logError(
    exception: unknown,
    request: FastifyRequest,
    correlationId: string,
    status: number,
    message?: string,
  ): void {
    const req = request as any;
    const errorDetails: any = {
      correlationId,
      statusCode: status,
      path: req.url || req.raw?.url || 'unknown',
      method: req.method || req.raw?.method || 'unknown',
      timestamp: new Date().toISOString(),
    };

    // Add user info if available (masked)
    if (req.user) {
      errorDetails.user = SensitiveDataMasker.maskSensitiveData(req.user);
    }

    // Add request body if available (masked)
    const requestBody = req.body || req.raw?.body;
    if (requestBody) {
      errorDetails.body = SensitiveDataMasker.maskSensitiveData(requestBody);
    }

    // Add query params if available (masked)
    const requestQuery = req.query || req.raw?.query;
    if (requestQuery) {
      errorDetails.query = SensitiveDataMasker.maskSensitiveData(requestQuery);
    }

    // Log error message
    const errorMessage = message || (exception instanceof Error ? exception.message : 'Unknown error');
    const maskedMessage = SensitiveDataMasker.maskString(errorMessage);

    // Log stack trace for 5xx errors (but mask sensitive data)
    if (status >= 500 && exception instanceof Error) {
      const maskedStack = SensitiveDataMasker.maskString(exception.stack || '');
      errorDetails.stack = maskedStack;
      
      this.appLogger.error(
        `[${correlationId}] ${maskedMessage}`,
        HttpExceptionFilter.name,
        errorDetails,
      );
    } else {
      this.appLogger.warn(
        `[${correlationId}] ${maskedMessage}`,
        HttpExceptionFilter.name,
        errorDetails,
      );
    }
  }
}

