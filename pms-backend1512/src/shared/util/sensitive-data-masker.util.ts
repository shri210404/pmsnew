/**
 * Utility functions for masking sensitive data in logs
 */

export class SensitiveDataMasker {
  /**
   * Mask sensitive data in an object or string
   * @param data - Data to mask (object, string, or any)
   * @param visited - Set to track visited objects and prevent circular references
   * @returns Masked data
   */
  static maskSensitiveData(data: any, visited: WeakSet<any> = new WeakSet()): any {
    if (data === null || data === undefined) {
      return data;
    }

    // If it's a string, mask it directly
    if (typeof data === 'string') {
      return this.maskString(data);
    }

    // If it's a primitive type (number, boolean, etc.), return as is
    if (typeof data !== 'object') {
      return data;
    }

    // Check for circular references
    if (visited.has(data)) {
      // Return a placeholder to prevent infinite recursion
      return '[Circular Reference]';
    }

    // Add current object to visited set
    visited.add(data);

    // If it's an array, mask each element
    if (Array.isArray(data)) {
      return data.map((item) => this.maskSensitiveData(item, visited));
    }

    // If it's an object, mask each property
    if (typeof data === 'object') {
      const masked: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const lowerKey = key.toLowerCase();
          
          // Mask password fields
          if (lowerKey.includes('password') || lowerKey.includes('pwd')) {
            masked[key] = '***';
          }
          // Mask token fields
          else if (lowerKey.includes('token') || lowerKey === 'authorization') {
            masked[key] = this.maskToken(data[key]);
          }
          // Mask secret fields
          else if (lowerKey.includes('secret') || lowerKey.includes('key')) {
            masked[key] = '***';
          }
          // Mask email (optional - show only domain)
          else if (lowerKey.includes('email') && typeof data[key] === 'string') {
            masked[key] = this.maskEmail(data[key]);
          }
          // Mask credit card numbers
          else if (lowerKey.includes('card') || lowerKey.includes('credit')) {
            masked[key] = this.maskCreditCard(data[key]);
          }
          // Mask SSN
          else if (lowerKey.includes('ssn') || lowerKey.includes('social')) {
            masked[key] = '***-**-****';
          }
          // Recursively mask nested objects (with visited set to prevent circular refs)
          else {
            masked[key] = this.maskSensitiveData(data[key], visited);
          }
        }
      }
      return masked;
    }

    return data;
  }

  /**
   * Mask a string that may contain sensitive patterns
   */
  static maskString(str: string): string {
    if (!str || typeof str !== 'string') {
      return str;
    }

    // Mask passwords in strings (e.g., "password: secret123")
    str = str.replace(/(password|pwd)\s*[:=]\s*[^\s,}]+/gi, '$1: ***');

    // Mask tokens in strings (e.g., "token: abc123xyz")
    str = str.replace(/(token|authorization|bearer)\s*[:=]\s*[^\s,}]+/gi, (match) => {
      const parts = match.split(/[:=]/);
      if (parts.length === 2) {
        return `${parts[0]}: ${this.maskToken(parts[1].trim())}`;
      }
      return match;
    });

    // Mask credit card numbers (16 digits, possibly with spaces/dashes)
    str = str.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '****-****-****-****');

    // Mask SSN (XXX-XX-XXXX)
    str = str.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****');

    return str;
  }

  /**
   * Mask a token (show only first 4 and last 4 characters)
   */
  private static maskToken(token: any): string {
    if (!token || typeof token !== 'string') {
      return '***';
    }

    if (token.length <= 8) {
      return '***';
    }

    const first4 = token.substring(0, 4);
    const last4 = token.substring(token.length - 4);
    const maskedLength = token.length - 8;
    return `${first4}${'*'.repeat(Math.min(maskedLength, 20))}${last4}`;
  }

  /**
   * Mask an email (show only domain or mask completely)
   */
  private static maskEmail(email: any): string {
    if (!email || typeof email !== 'string') {
      return email;
    }

    const emailRegex = /^([^@]+)@(.+)$/;
    const match = email.match(emailRegex);
    
    if (match) {
      // Show only domain: ***@example.com
      return `***@${match[2]}`;
    }

    return '***';
  }

  /**
   * Mask a credit card number
   */
  private static maskCreditCard(card: any): string {
    if (!card || typeof card !== 'string') {
      return '***';
    }

    // Remove spaces and dashes
    const cleaned = card.replace(/[\s-]/g, '');
    
    if (cleaned.length >= 4) {
      const last4 = cleaned.substring(cleaned.length - 4);
      return `****-****-****-${last4}`;
    }

    return '***';
  }
}

