import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

/**
 * Error Interceptor
 * Catches all HTTP errors and provides user-friendly error messages
 * Shows consistent snackbar notifications
 * Handles specific error codes appropriately
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip error handling for public routes (they handle their own errors)
      const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/renew-token'];
      const isPublicRoute = publicRoutes.some(route => req.url.includes(route));

      // Don't show error snackbar for public routes (they handle their own errors)
      if (!isPublicRoute) {
        let errorMessage = 'An error occurred. Please try again.';
        let action = 'Close';
        let duration = 5000;

        // Handle specific error codes
        switch (error.status) {
          case 0:
            // Network error or CORS issue
            errorMessage = 'Network error. Please check your internet connection.';
            break;

          case 400:
            // Bad Request
            errorMessage = error.error?.message || 'Invalid request. Please check your input.';
            break;

          case 401:
            // Unauthorized - handled by auth interceptor, but show message if not redirected
            errorMessage = 'Your session has expired. Please login again.';
            // Don't show snackbar for 401 as auth interceptor will redirect
            break;

          case 403:
            // Forbidden
            errorMessage = error.error?.message || 'You do not have permission to perform this action.';
            break;

          case 404:
            // Not Found
            errorMessage = error.error?.message || 'The requested resource was not found.';
            break;

          case 409:
            // Conflict
            errorMessage = error.error?.message || 'A conflict occurred. The resource may already exist.';
            break;

          case 422:
            // Unprocessable Entity (validation errors)
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.error?.errors) {
              // Handle validation errors array
              const validationErrors = error.error.errors;
              if (Array.isArray(validationErrors)) {
                errorMessage = validationErrors.join(', ');
              } else if (typeof validationErrors === 'object') {
                errorMessage = Object.values(validationErrors).flat().join(', ');
              }
            } else {
              errorMessage = 'Validation failed. Please check your input.';
            }
            break;

          case 429:
            // Too Many Requests (rate limiting)
            errorMessage = error.error?.message || 'Too many requests. Please wait a moment and try again.';
            duration = 7000;
            break;

          case 500:
            // Internal Server Error
            errorMessage = 'A server error occurred. Please try again later or contact support.';
            break;

          case 502:
            // Bad Gateway
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            break;

          case 503:
            // Service Unavailable
            errorMessage = 'Service is temporarily unavailable. Please try again later.';
            break;

          case 504:
            // Gateway Timeout
            errorMessage = 'Request timeout. Please try again.';
            break;

          default:
            // Other errors
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
            break;
        }

        // Show error snackbar (except for 401 which is handled by auth interceptor)
        if (error.status !== 401) {
          snackBar.open(errorMessage, action, {
            duration: duration,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        }

        // Log error to console for debugging (in development)
        if (!environment.production) {
          console.error('HTTP Error:', {
            status: error.status,
            statusText: error.statusText,
            url: req.url,
            method: req.method,
            error: error.error,
            correlationId: error.headers?.get('X-Correlation-ID'),
          });
        }
      }

      // Re-throw the error so components can handle it if needed
      return throwError(() => error);
    })
  );
};

// Import environment for production check
import { environment } from '../../../environments/environment';


