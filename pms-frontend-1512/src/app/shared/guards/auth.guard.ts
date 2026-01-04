import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { isTokenExpired, decodeJwtToken } from '../util/jwt.util';

/**
 * AuthGuard - Validates user authentication before allowing route access
 * 
 * This guard:
 * - Checks if user has a valid JWT token
 * - Validates token expiry
 * - Attempts token refresh if token is expired but refresh token is valid
 * - Redirects to login if authentication fails
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private cachedUser: { token: string; userDetails: any; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private lastCheck: { url: string; result: boolean; timestamp: number } | null = null;
  private readonly CHECK_CACHE_DURATION = 1000; // Cache guard result for 1 second to prevent loops

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    console.log('[AuthGuard] Checking authentication for route:', state.url);
    
    // Prevent repeated checks for the same route within 1 second (prevents loops)
    if (this.lastCheck && 
        this.lastCheck.url === state.url && 
        (Date.now() - this.lastCheck.timestamp) < this.CHECK_CACHE_DURATION) {
      console.log('[AuthGuard] Using cached result to prevent loop:', this.lastCheck.result);
      return this.lastCheck.result;
    }
    
    // Get account details from localStorage
    const accountDetailsStr = localStorage.getItem('account-details');
    
    if (!accountDetailsStr) {
      console.warn('[AuthGuard] No account details found in localStorage');
      this.lastCheck = { url: state.url, result: false, timestamp: Date.now() };
      this.handleAuthFailure();
      return false;
    }

    try {
      const accountDetails = JSON.parse(accountDetailsStr);
      const authToken = accountDetails?.authToken;
      // Backend returns 'userdetails' (lowercase) - check both for compatibility
      const userDetails = accountDetails?.userdetails || accountDetails?.userDetails;

      if (!authToken) {
        console.warn('[AuthGuard] No auth token found');
        this.lastCheck = { url: state.url, result: false, timestamp: Date.now() };
        this.handleAuthFailure();
        return false;
      }

      if (!userDetails) {
        console.warn('[AuthGuard] No user details found');
        this.lastCheck = { url: state.url, result: false, timestamp: Date.now() };
        this.handleAuthFailure();
        return false;
      }

      // Decode token to verify it's valid format FIRST
      const payload = decodeJwtToken(authToken);
      if (!payload) {
        console.warn('[AuthGuard] Invalid token format');
        this.handleAuthFailure();
        return false;
      }

      // Verify token payload matches stored user details
      if (payload.id !== userDetails.id || payload.username !== userDetails.username) {
        console.warn('[AuthGuard] Token payload mismatch', {
          tokenId: payload.id,
          storedId: userDetails.id,
          tokenUsername: payload.username,
          storedUsername: userDetails.username
        });
        this.handleAuthFailure();
        return false;
      }

      // Check token expiry with detailed logging
      const tokenExpired = isTokenExpired(authToken);
      const timeUntilExpiry = payload.exp ? (payload.exp * 1000 - Date.now()) : null;
      console.log('[AuthGuard] Token expiry check:', {
        expired: tokenExpired,
        expiryTime: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'unknown',
        timeUntilExpiry: timeUntilExpiry ? `${Math.round(timeUntilExpiry / 1000)}s` : 'unknown',
        currentTime: new Date().toISOString()
      });

      // Check if token is expired (only if token is valid)
      if (tokenExpired) {
        console.log('[AuthGuard] Token expired, attempting refresh...');
        // Try to refresh token
        return this.attemptTokenRefresh().pipe(
          map((success: boolean) => {
            if (success) {
              console.log('[AuthGuard] Token refresh successful, re-validating...');
              // Re-read account details after refresh
              const refreshedAccountDetailsStr = localStorage.getItem('account-details');
              if (!refreshedAccountDetailsStr) {
                console.warn('[AuthGuard] No account details after refresh');
                this.handleAuthFailure();
                return false;
              }
              
              try {
                const refreshedAccountDetails = JSON.parse(refreshedAccountDetailsStr);
                const refreshedToken = refreshedAccountDetails?.authToken;
                const refreshedUserDetails = refreshedAccountDetails?.userdetails || refreshedAccountDetails?.userDetails;
                
                if (!refreshedToken || !refreshedUserDetails) {
                  console.warn('[AuthGuard] Missing token or user details after refresh');
                  this.handleAuthFailure();
                  return false;
                }
                
                // Validate the refreshed token
                const refreshedPayload = decodeJwtToken(refreshedToken);
                if (!refreshedPayload) {
                  console.warn('[AuthGuard] Invalid refreshed token format');
                  this.handleAuthFailure();
                  return false;
                }
                
                // Verify token payload matches stored user details
                if (refreshedPayload.id !== refreshedUserDetails.id || refreshedPayload.username !== refreshedUserDetails.username) {
                  console.warn('[AuthGuard] Refreshed token payload mismatch', {
                    tokenId: refreshedPayload.id,
                    storedId: refreshedUserDetails.id,
                    tokenUsername: refreshedPayload.username,
                    storedUsername: refreshedUserDetails.username
                  });
                  this.handleAuthFailure();
                  return false;
                }
                
                // Cache the refreshed user info
                this.cacheUser(refreshedToken, refreshedUserDetails);
                
                // Cache the guard result to prevent loops
                this.lastCheck = { url: state.url, result: true, timestamp: Date.now() };
                
                console.log('[AuthGuard] Refreshed token validated successfully');
                return true;
              } catch (error) {
                console.error('[AuthGuard] Error validating refreshed token:', error);
                this.handleAuthFailure();
                return false;
              }
            }
            console.warn('[AuthGuard] Token refresh failed');
            this.handleAuthFailure();
            return false;
          }),
          catchError((error) => {
            console.error('[AuthGuard] Token refresh error:', error);
            this.handleAuthFailure();
            return of(false);
          })
        );
      }

      // Token is valid, cache user info
      this.cacheUser(authToken, userDetails);
      
      // Cache the guard result to prevent loops
      this.lastCheck = { url: state.url, result: true, timestamp: Date.now() };
      
      console.log('[AuthGuard] Authentication successful');
      return true;
    } catch (error) {
      console.error('[AuthGuard] Error parsing account details:', error);
      this.handleAuthFailure();
      return false;
    }
  }

  /**
   * Attempt to refresh the access token
   */
  private attemptTokenRefresh(): Observable<boolean> {
    console.log('[AuthGuard] Starting token refresh...');
    // withCredentials is now set globally in app.config.ts
    return this.http.get<{ authToken: string; userDetails?: any; userdetails?: any }>(`${environment.apiUrl}/auth/renew-token`).pipe(
      timeout(10000), // 10 second timeout
      map((response) => {
        console.log('[AuthGuard] Token refresh response received:', response);
        if (response && response.authToken) {
          // Update stored token
          const accountDetailsStr = localStorage.getItem('account-details');
          if (accountDetailsStr) {
            try {
              const accountDetails = JSON.parse(accountDetailsStr);
              accountDetails.authToken = response.authToken;
              // Backend may return userDetails or userdetails (case sensitivity)
              if (response.userDetails) {
                accountDetails.userdetails = response.userDetails;
              } else if (response.userdetails) {
                accountDetails.userdetails = response.userdetails;
              }
              localStorage.setItem('account-details', JSON.stringify(accountDetails));
              
              // Update cache
              const userDetails = response.userDetails || response.userdetails || accountDetails.userdetails;
              this.cacheUser(response.authToken, userDetails);
              
              console.log('[AuthGuard] Token refresh successful');
              return true;
            } catch (error) {
              console.error('[AuthGuard] Error updating account details:', error);
              return false;
            }
          }
        }
        return false;
      }),
      catchError((error) => {
        if (error.name === 'TimeoutError') {
          console.error('[AuthGuard] Token refresh timed out after 10 seconds');
        } else {
          console.error('[AuthGuard] Token refresh failed:', error);
        }
        return of(false);
      })
    );
  }

  /**
   * Cache user information to avoid repeated localStorage reads
   */
  private cacheUser(token: string, userDetails: any): void {
    this.cachedUser = {
      token,
      userDetails,
      timestamp: Date.now()
    };
  }

  /**
   * Get cached user if still valid
   */
  private getCachedUser(): { token: string; userDetails: any } | null {
    if (this.cachedUser && (Date.now() - this.cachedUser.timestamp) < this.CACHE_DURATION) {
      return {
        token: this.cachedUser.token,
        userDetails: this.cachedUser.userDetails
      };
    }
    return null;
  }

  /**
   * Handle authentication failure
   */
  private handleAuthFailure(): void {
    console.warn('[AuthGuard] Authentication failed, redirecting to login');
    localStorage.removeItem('account-details');
    this.cachedUser = null;
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url }
    });
  }
}

