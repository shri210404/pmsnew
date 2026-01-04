/**
 * JWT Utility Functions
 * 
 * Provides functions to decode and validate JWT tokens without verification
 * (verification is done by the backend).
 */

export interface JwtPayload {
  id?: string;
  username?: string;
  role?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

/**
 * Decode JWT token without verification
 * Note: This only decodes the token, it does NOT verify the signature.
 * Signature verification is done by the backend.
 */
export function decodeJwtToken(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtToken(token);
  if (!payload || !payload.exp) {
    return true; // Consider expired if no expiry or can't decode
  }
  
  // exp is in seconds, Date.now() is in milliseconds
  const expiryTime = payload.exp * 1000;
  const currentTime = Date.now();
  
  // Add 1 minute buffer to refresh before actual expiry
  // (Token expires in 5 minutes, so we refresh when 1 minute remains)
  const bufferTime = 1 * 60 * 1000; // 1 minute in milliseconds
  
  return currentTime >= (expiryTime - bufferTime);
}

/**
 * Get token expiry time in milliseconds
 */
export function getTokenExpiry(token: string): number | null {
  const payload = decodeJwtToken(token);
  if (!payload || !payload.exp) {
    return null;
  }
  return payload.exp * 1000; // Convert to milliseconds
}

/**
 * Get time until token expires in milliseconds
 */
export function getTimeUntilExpiry(token: string): number | null {
  const expiry = getTokenExpiry(token);
  if (!expiry) {
    return null;
  }
  return expiry - Date.now();
}

