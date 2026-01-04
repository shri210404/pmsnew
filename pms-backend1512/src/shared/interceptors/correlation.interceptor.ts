import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

/**
 * Correlation ID Interceptor
 * Generates a unique correlation ID for each request and includes it in:
 * - Request headers (X-Correlation-ID)
 * - Response headers (X-Correlation-ID)
 * - All logs (via request object)
 */
@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const response = context.switchToHttp().getResponse<FastifyReply>();

    // Get correlation ID from request header or generate new one
    const req = request as any;
    const res = response as any;
    const headers = req.headers || req.raw?.headers || {};
    const correlationId =
      (headers['x-correlation-id'] as string) ||
      (headers['X-Correlation-ID'] as string) ||
      uuidv4();

    // Attach correlation ID to request object for use in logs
    req.correlationId = correlationId;

    // Add correlation ID to response headers
    res.header('X-Correlation-ID', correlationId);

    return next.handle().pipe(
      tap({
        next: () => {
          // Correlation ID is already set in response header
        },
        error: () => {
          // Correlation ID is already set in response header
        },
      }),
    );
  }
}

