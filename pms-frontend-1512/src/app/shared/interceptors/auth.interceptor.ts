import { HttpInterceptorFn, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, of } from 'rxjs';
import { environment } from '../../../environments/environment';

// Flag to prevent multiple simultaneous token refresh attempts
let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const http = inject(HttpClient);

  // Get token from localStorage
  const accountDetails = localStorage.getItem('account-details');
  let authToken: string | null = null;

  if (accountDetails) {
    try {
      const parsed = JSON.parse(accountDetails);
      authToken = parsed?.authToken || null;
    } catch (error) {
      console.error('Error parsing account details:', error);
    }
  }

  // Clone the request and add the Authorization header if token exists
  // Skip adding token for public routes (login, register, forgot-password, reset-password)
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/renew-token'];
  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));

  // For public routes, ensure we don't interfere with the request
  if (isPublicRoute) {
    console.log('[AuthInterceptor] Public route detected, skipping token addition:', req.url);
    // For login requests, just pass through without any modification
    return next(req);
  }

  // Don't add token to login requests - they should be completely public
  if (authToken && !isPublicRoute) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
  }

  // Handle the request and catch 401 errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If we get a 401 Unauthorized error, try to refresh token
      if (error.status === HttpStatusCode.Unauthorized && !isPublicRoute) {
        // If already refreshing, wait for the refresh to complete
        if (isRefreshing) {
          // Wait for the refresh token to be available
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(() => {
              // Retry the original request with new token
              const newToken = getAuthToken();
              if (newToken) {
                const clonedReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
                return next(clonedReq);
              }
              // If no token, redirect to login
              handleAuthError(router);
              return throwError(() => error);
            })
          );
        }

        // Start token refresh process
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return attemptTokenRefresh(http).pipe(
          switchMap((success: boolean) => {
            isRefreshing = false;
            if (success) {
              refreshTokenSubject.next(true);
              // Retry the original request with new token
              const newToken = getAuthToken();
              console.log('[AuthInterceptor] Retrying original request with new token:', newToken ? newToken.substring(0, 20) + '...' : 'null');
              if (newToken) {
                const clonedReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
                console.log('[AuthInterceptor] Retrying request to:', clonedReq.url);
                return next(clonedReq);
              } else {
                console.error('[AuthInterceptor] Token refresh succeeded but new token not found in localStorage');
                // Don't logout immediately - token might be in cookie, try the request anyway
                refreshTokenSubject.next(false);
                return throwError(() => new Error('Token refresh succeeded but token not found'));
              }
            }
            // If refresh failed, redirect to login
            console.error('[AuthInterceptor] Token refresh failed, logging out');
            refreshTokenSubject.next(false);
            handleAuthError(router);
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            console.error('[AuthInterceptor] Token refresh error caught:', refreshError);
            refreshTokenSubject.next(false);
            // Only logout if it's a real error, not if it's just that we couldn't get the token
            if (refreshError?.message !== 'Token refresh succeeded but token not found') {
              handleAuthError(router);
            }
            return throwError(() => refreshError);
          })
        );
      }

      // For other errors, just re-throw
      return throwError(() => error);
    })
  );
};

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  const accountDetails = localStorage.getItem('account-details');
  if (accountDetails) {
    try {
      const parsed = JSON.parse(accountDetails);
      return parsed?.authToken || null;
    } catch (error) {
      console.error('Error parsing account details:', error);
    }
  }
  return null;
}

/**
 * Attempt to refresh the access token using refresh token
 */
function attemptTokenRefresh(http: HttpClient) {
  console.log('[AuthInterceptor] Attempting token refresh...');
  // Call renew-token endpoint (refresh token is in cookie)
  // Cookies are sent via credentials interceptor
  return http.get(`${environment.apiUrl}/auth/renew-token`).pipe(
    switchMap((response: any) => {
      console.log('[AuthInterceptor] Token refresh response received:', response);
      console.log('[AuthInterceptor] Response has authToken:', !!response?.authToken);
      console.log('[AuthInterceptor] Response has userdetails:', !!response?.userdetails);
      console.log('[AuthInterceptor] Response has userDetails:', !!response?.userDetails);
      
      if (response && response.authToken) {
        // Update stored token
        const accountDetails = localStorage.getItem('account-details');
        if (accountDetails) {
          try {
            const parsed = JSON.parse(accountDetails);
            const oldToken = parsed.authToken;
            parsed.authToken = response.authToken;
            
            // Update user details - prefer userdetails (lowercase) as that's what backend returns
            if (response.userdetails) {
              parsed.userdetails = response.userdetails;
              console.log('[AuthInterceptor] Updated userdetails from response.userdetails:', response.userdetails);
            } else if (response.userDetails) {
              parsed.userdetails = response.userDetails;
              console.log('[AuthInterceptor] Updated userdetails from response.userDetails:', response.userDetails);
            } else {
              console.warn('[AuthInterceptor] No userdetails in response, keeping existing');
            }
            
            localStorage.setItem('account-details', JSON.stringify(parsed));
            console.log('[AuthInterceptor] Token refresh successful - localStorage updated');
            console.log('[AuthInterceptor] Old token:', oldToken?.substring(0, 20) + '...');
            console.log('[AuthInterceptor] New token:', response.authToken?.substring(0, 20) + '...');
            return of(true); // Return as observable
          } catch (error) {
            console.error('[AuthInterceptor] Error updating account details:', error);
            console.error('[AuthInterceptor] Error details:', error);
            return of(false);
          }
        } else {
          console.warn('[AuthInterceptor] No account details in localStorage to update');
          return of(false);
        }
      } else {
        console.warn('[AuthInterceptor] Token refresh failed - invalid response:', response);
        console.warn('[AuthInterceptor] Response type:', typeof response);
        console.warn('[AuthInterceptor] Response keys:', response ? Object.keys(response) : 'null/undefined');
        return of(false);
      }
    }),
    catchError((error) => {
      console.error('[AuthInterceptor] Token refresh HTTP error:', error);
      console.error('[AuthInterceptor] Error status:', error?.status);
      console.error('[AuthInterceptor] Error message:', error?.message);
      console.error('[AuthInterceptor] Error body:', error?.error);
      return of(false);
    })
  );
}

/**
 * Handle authentication error - clear storage and redirect to login
 */
function handleAuthError(router: Router): void {
  localStorage.removeItem('account-details');
  router.navigate(['/login']);
}


