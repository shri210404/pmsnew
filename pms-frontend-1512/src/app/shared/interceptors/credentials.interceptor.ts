import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Credentials Interceptor
 * 
 * Adds withCredentials: true to all HTTP requests to ensure cookies are sent
 * with cross-origin requests (required for refresh token cookies)
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone the request and add withCredentials option
  const clonedReq = req.clone({
    withCredentials: true // Include credentials (cookies) for all requests
  });

  return next(clonedReq);
};

