import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { isTokenExpired, decodeJwtToken } from '../util/jwt.util';

/**
 * RoleGuard - Validates user role before allowing route access
 * 
 * This guard:
 * - Validates JWT token before checking role
 * - Caches user role to avoid repeated localStorage reads
 * - Handles nested routes and query params
 * - Handles token expiry gracefully
 * - Logs access denials for security auditing
 * 
 * Note: This guard should be used AFTER AuthGuard to ensure user is authenticated
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private cachedRole: { role: string; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private lastCheck: { url: string; result: boolean; timestamp: number } | null = null;
  private readonly CHECK_CACHE_DURATION = 1000; // Cache guard result for 1 second to prevent loops

  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    console.log('[RoleGuard] Checking role access for route:', state.url);
    
    // Prevent repeated checks for the same route within 1 second (prevents loops)
    if (this.lastCheck && 
        this.lastCheck.url === state.url && 
        (Date.now() - this.lastCheck.timestamp) < this.CHECK_CACHE_DURATION) {
      console.log('[RoleGuard] Using cached result to prevent loop:', this.lastCheck.result);
      return this.lastCheck.result;
    }
    
    // Get account details from localStorage (always read fresh to get latest token after refresh)
    const accountDetailsStr = localStorage.getItem('account-details');
    
    if (!accountDetailsStr) {
      console.warn('[RoleGuard] No account details found in localStorage');
      this.logAccessDenial('No account details found', state.url);
      this.lastCheck = { url: state.url, result: false, timestamp: Date.now() };
      this.handleAccessDenied();
      return false;
    }

    try {
      const accountDetails = JSON.parse(accountDetailsStr);
      const authToken = accountDetails?.authToken;
      const userDetails = accountDetails?.userdetails || accountDetails?.userDetails; // Check both cases

      console.log('[RoleGuard] Token present:', !!authToken, 'User details present:', !!userDetails);
      console.log('[RoleGuard] User details:', userDetails);

      if (!authToken || !userDetails) {
        console.warn('[RoleGuard] Missing token or user details', { hasToken: !!authToken, hasUserDetails: !!userDetails });
        this.logAccessDenial('Missing token or user details', state.url);
        this.lastCheck = { url: state.url, result: false, timestamp: Date.now() };
        this.handleAccessDenied();
        return false;
      }

      // Don't check token expiry here - AuthGuard already handles that
      // If we reach here, AuthGuard has already validated/refreshed the token
      // Just verify the token format is valid
      const payload = decodeJwtToken(authToken);
      if (!payload) {
        console.warn('[RoleGuard] Invalid token format - AuthGuard should have caught this');
        this.logAccessDenial('Invalid token format', state.url);
        this.lastCheck = { url: state.url, result: false, timestamp: Date.now() };
        this.handleAccessDenied();
        return false;
      }
      
      console.log('[RoleGuard] Token is valid (AuthGuard already validated it)');

      // Get user role (from cache if available, otherwise from localStorage)
      const userRole = this.getUserRole(userDetails, payload);
      console.log('[RoleGuard] User role:', userRole);

      if (!userRole) {
        console.warn('[RoleGuard] No role found in userDetails or token payload');
        console.warn('[RoleGuard] userDetails:', userDetails);
        console.warn('[RoleGuard] payload:', payload);
        this.logAccessDenial('No role found', state.url);
        this.lastCheck = { url: state.url, result: false, timestamp: Date.now() };
        this.handleAccessDenied();
        return false;
      }

      // Define role-based access
      const allowedRoutes: { [key: string]: string[] } = {
        'Finance Manager': ['dashboard', 'template', 'proposal', 'submission', 'admin', 'reports', 'future-jobs', 'future-jobs-form', 'job-order'],
        'Business Head': ['dashboard', 'template', 'proposal', 'submission', 'admin', 'reports', 'future-jobs', 'future-jobs-form', 'job-order'],
        'HR Manager': ['dashboard', 'template', 'proposal', 'submission', 'admin', 'reports', 'future-jobs', 'future-jobs-form', 'job-order'],
        'Recruiter': ['dashboard', 'proposal', 'reports', 'future-jobs', 'future-jobs-form', 'job-order'],
        'Client Manager': ['dashboard', 'proposal', 'reports', 'submission', 'future-jobs', 'future-jobs-form', 'job-order'],
        'Delivery Manager': ['dashboard', 'template', 'proposal', 'reports', 'submission', 'future-jobs', 'future-jobs-form', 'job-order'],
        'Admin': ['dashboard', 'profile', 'template', 'proposal', 'submission', 'admin', 'reports', 'set-roles', 'add-client', 'add-country', 'add-language', 'add-currency', 'add-employee', 'set-user-roles', 'add-user-client', 'future-jobs', 'future-jobs-form', 'job-order']
      };

      // Extract route path - handle nested routes
      const routePath = this.extractRoutePath(next);
      console.log('[RoleGuard] Extracted route path:', routePath, 'from URL:', state.url, 'route config:', next.routeConfig?.path);

      // If routePath is empty (parent route), allow access (child routes will be checked separately)
      if (!routePath || routePath === '') {
        console.log('[RoleGuard] Parent route detected, allowing access');
        this.lastCheck = { url: state.url, result: true, timestamp: Date.now() };
        return true;
      }

      // Check if the route matches the user role
      // Also check for nested routes like 'job-order/create' - extract base route
      const baseRoute = routePath.includes('/') ? routePath.split('/')[0] : routePath;
      const isAllowed = allowedRoutes[userRole]?.includes(baseRoute) || allowedRoutes[userRole]?.includes(routePath);
      
      if (isAllowed) {
        // Cache the guard result to prevent loops
        this.lastCheck = { url: state.url, result: true, timestamp: Date.now() };
        console.log('[RoleGuard] Access granted for role:', userRole, 'route:', routePath, 'baseRoute:', baseRoute);
        return true; // User is allowed to access this route
      }

      // Access denied - log and redirect
      this.logAccessDenial(`Role '${userRole}' not allowed for route '${routePath}' (base: '${baseRoute}')`, state.url, userRole);
      console.warn('[RoleGuard] Access denied. Allowed routes for role:', allowedRoutes[userRole]);
      console.warn('[RoleGuard] Requested route:', routePath, 'baseRoute:', baseRoute);
      this.lastCheck = { url: state.url, result: false, timestamp: Date.now() };
      // Redirect to dashboard instead of login if user is authenticated
      if (authToken && userDetails) {
        console.log('[RoleGuard] User authenticated but lacks permission, redirecting to dashboard');
        this.router.navigate(['/app/dashboard']);
      } else {
        this.handleAccessDenied();
      }
      return false;
    } catch (error) {
      console.error('[RoleGuard] Error parsing account details:', error);
      this.logAccessDenial('Error parsing account details', state.url);
      this.lastCheck = { url: state.url, result: false, timestamp: Date.now() };
      this.handleAccessDenied();
      return false;
    }
  }

  /**
   * Get user role with caching
   */
  private getUserRole(userDetails: any, tokenPayload: any): string | null {
    // Check cache first
    if (this.cachedRole && (Date.now() - this.cachedRole.timestamp) < this.CACHE_DURATION) {
      return this.cachedRole.role;
    }

    // Get role from userDetails (preferred) or token payload
    const role = userDetails?.role || tokenPayload?.role || null;

    // Cache the role
    if (role) {
      this.cachedRole = {
        role,
        timestamp: Date.now()
      };
    }

    return role;
  }

  /**
   * Extract route path from ActivatedRouteSnapshot
   * Handles nested routes and query params
   * For routes like '/app/job-order/create', we want 'job-order' (the parent route)
   */
  private extractRoutePath(route: ActivatedRouteSnapshot): string {
    // Build the full path from URL segments
    // For '/app/job-order/create', segments would be ['app', 'job-order', 'create']
    // We want to get the first meaningful route after 'app'
    
    const segments: string[] = [];
    let currentRoute: ActivatedRouteSnapshot | null = route;
    
    // Collect all URL segments from the route tree
    while (currentRoute) {
      if (currentRoute.url.length > 0) {
        segments.push(...currentRoute.url.map(seg => seg.path));
      }
      currentRoute = currentRoute.firstChild;
    }
    
    // Remove 'app' if it's the first segment
    const filteredSegments = segments.filter(seg => seg !== 'app');
    
    // For nested routes like 'job-order/create', return the parent route 'job-order'
    // For simple routes like 'dashboard', return 'dashboard'
    if (filteredSegments.length > 0) {
      // Return the first segment after 'app' (the main route)
      return filteredSegments[0];
    }
    
    // Fallback to route config path if no URL segments
    const routePath = route.routeConfig?.path || '';
    // Exclude parent routes like 'app'
    if (routePath === 'app' || routePath === '') {
      return '';
    }
    return routePath;
  }

  /**
   * Log access denial for security auditing
   */
  private logAccessDenial(reason: string, route: string, role?: string): void {
    const logMessage = `[RoleGuard] Access denied: ${reason} | Route: ${route}${role ? ` | Role: ${role}` : ''}`;
    console.warn(logMessage);
    
    // In production, you might want to send this to a logging service
    // Example: this.loggingService.logSecurityEvent('ACCESS_DENIED', { reason, route, role });
  }

  /**
   * Handle access denied - redirect to appropriate page
   */
  private handleAccessDenied(): void {
    // Redirect to login or dashboard based on context
    // If user is authenticated but doesn't have permission, redirect to dashboard
    // If user is not authenticated, AuthGuard will handle redirect
    const accountDetailsStr = localStorage.getItem('account-details');
    if (accountDetailsStr) {
      try {
        const accountDetails = JSON.parse(accountDetailsStr);
        if (accountDetails?.authToken) {
          // User is authenticated but lacks permission - redirect to dashboard
          this.router.navigate(['/app/dashboard']);
        } else {
          // No token - redirect to login
          this.router.navigate(['/login']);
        }
      } catch {
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}
