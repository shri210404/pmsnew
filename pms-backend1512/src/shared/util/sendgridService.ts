import { BadRequestException, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as sanitizeHtml from 'sanitize-html';
import * as validator from 'email-validator';
import { AppLogger } from './applogger.service';

@Injectable()
export class NodeEmailService {
  private transporter: nodemailer.Transporter;
  private readonly logContext = 'NodeEmailService';

  constructor(private readonly logger: AppLogger) {
    const smtpHost = process.env.SMTP_HOST || 'smtp.zoho.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    const smtpSecure = process.env.SMTP_SECURE !== 'false'; // Default to true (SSL)
    
    this.transporter = nodemailer.createTransport({
      host: smtpHost, // SMTP Server from environment
      port: smtpPort, // Use 465 for SSL or 587 for TLS
      secure: smtpSecure, // true for port 465, false for 587
      auth: {
        user: process.env.REPORT_MAIL,
        pass: process.env.REPORT_PASS, // Use an App Password from Zoho
      },
    });
  }

  /**
   * Send email with security validations and sanitization
   * @param from - Sender name (will be sanitized)
   * @param to - Recipient email address(es) - comma-separated string or array
   * @param subject - Email subject (will be sanitized)
   * @param body - Email HTML body (will be sanitized)
   * @param cc - CC email address(es) - optional, comma-separated string or array
   */
  async sendEmail(
    from: string,
    to: string | string[],
    subject: string,
    body: string,
    cc?: string | string[],
  ) {
    try {
      // 1. Validate and sanitize email addresses
      const validatedTo = this.validateAndSanitizeEmailAddresses(to);
      const validatedCc = cc ? this.validateAndSanitizeEmailAddresses(cc) : undefined;

      // 2. Sanitize sender name (prevent header injection)
      const sanitizedFrom = this.sanitizeHeader(from);

      // 3. Sanitize subject (prevent header injection and newlines)
      const sanitizedSubject = this.sanitizeSubject(subject);

      // 4. Sanitize HTML body (remove dangerous scripts and tags)
      const sanitizedBody = this.sanitizeHtmlBody(body);

      // 5. Build final subject with sender name
      const finalSubject = `${sanitizedSubject} - ${sanitizedFrom}`;

      const mailOptions: nodemailer.SendMailOptions = {
        from: process.env.REPORT_MAIL, // Always use configured email, never user input
        to: validatedTo,
        cc: validatedCc,
        subject: finalSubject,
        html: sanitizedBody,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email sent successfully to: ${Array.isArray(validatedTo) ? validatedTo.join(', ') : validatedTo}`,
        this.logContext,
      );
      return info;
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`, this.logContext);
      throw new BadRequestException('Failed to send email: ' + error.message);
    }
  }

  /**
   * Validate and sanitize email addresses
   * Prevents email header injection by ensuring only valid email addresses
   */
  private validateAndSanitizeEmailAddresses(
    emails: string | string[],
  ): string | string[] {
    const emailArray = Array.isArray(emails) ? emails : emails.split(',').map((e) => e.trim());
    
    const validatedEmails = emailArray
      .map((email) => {
        // Remove any newlines, carriage returns, and other control characters
        const cleaned = email.replace(/[\r\n\t]/g, '').trim();
        
        // Validate email format
        if (!validator.validate(cleaned)) {
          this.logger.warn(`Invalid email address rejected: ${cleaned}`, this.logContext);
          throw new BadRequestException(`Invalid email address: ${cleaned}`);
        }

        // Ensure no header injection attempts (no colons, angle brackets, etc.)
        if (/[:<>]/.test(cleaned)) {
          this.logger.warn(`Potential header injection attempt detected: ${cleaned}`, this.logContext);
          throw new BadRequestException(`Invalid email address format: ${cleaned}`);
        }

        return cleaned;
      })
      .filter((email) => email.length > 0);

    if (validatedEmails.length === 0) {
      throw new BadRequestException('At least one valid email address is required');
    }

    // Return as array if multiple, single string if one
    return Array.isArray(emails) && emails.length > 1
      ? validatedEmails
      : validatedEmails[0];
  }

  /**
   * Sanitize email subject to prevent header injection
   * Removes newlines, carriage returns, and other dangerous characters
   */
  private sanitizeSubject(subject: string): string {
    if (!subject || typeof subject !== 'string') {
      throw new BadRequestException('Email subject is required and must be a string');
    }

    // Remove newlines, carriage returns, and other control characters
    let sanitized = subject
      .replace(/[\r\n\t]/g, ' ') // Replace newlines with spaces
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim();

    // Limit subject length (RFC 5322 recommends max 78 characters, but we allow more)
    const maxLength = 200;
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
      this.logger.warn(
        `Email subject truncated from ${subject.length} to ${maxLength} characters`,
        this.logContext,
      );
    }

    return sanitized;
  }

  /**
   * Sanitize header fields (from name, etc.) to prevent header injection
   */
  private sanitizeHeader(header: string): string {
    if (!header || typeof header !== 'string') {
      return 'Unknown';
    }

    // Remove newlines, carriage returns, and other control characters
    let sanitized = header
      .replace(/[\r\n\t]/g, ' ') // Replace newlines with spaces
      .replace(/[<>:]/g, '') // Remove angle brackets and colons
      .trim();

    // Limit length
    const maxLength = 100;
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized || 'Unknown';
  }

  /**
   * Sanitize HTML email body to remove dangerous scripts and tags
   */
  private sanitizeHtmlBody(html: string): string {
    if (!html || typeof html !== 'string') {
      throw new BadRequestException('Email body is required and must be a string');
    }

    // Use sanitize-html to remove dangerous content
    const sanitized = sanitizeHtml(html, {
      allowedTags: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'a',
        'img',
        'div',
        'span',
        'table',
        'thead',
        'tbody',
        'tr',
        'td',
        'th',
        'hr',
        'blockquote',
        'pre',
        'code',
      ],
      allowedAttributes: {
        a: ['href', 'title', 'target'],
        img: ['src', 'alt', 'width', 'height'],
        div: ['style'],
        span: ['style'],
        p: ['style'],
        table: ['style', 'border', 'cellpadding', 'cellspacing'],
        td: ['style', 'colspan', 'rowspan'],
        th: ['style', 'colspan', 'rowspan'],
      },
      allowedStyles: {
        '*': {
          color: [/^#[0-9a-fA-F]{3,6}$/, /^rgb/, /^rgba/],
          'background-color': [/^#[0-9a-fA-F]{3,6}$/, /^rgb/, /^rgba/],
          'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
          'font-size': [/^\d+(?:px|em|rem|%)$/],
          'font-family': [/^[a-zA-Z\s,]+$/],
          'font-weight': [/^normal$/, /^bold$/, /^\d+$/],
          'text-decoration': [/^none$/, /^underline$/, /^line-through$/],
          'padding': [/^\d+(?:px|em|rem|%)$/],
          'margin': [/^\d+(?:px|em|rem|%)$/],
          'border': [/^\d+px\s+\w+\s+#?[0-9a-fA-F]{3,6}$/],
          'border-radius': [/^\d+(?:px|em|rem|%)$/],
          'width': [/^\d+(?:px|em|rem|%)$/],
          'height': [/^\d+(?:px|em|rem|%)$/],
          'max-width': [/^\d+(?:px|em|rem|%)$/],
          'line-height': [/^\d+(?:\.\d+)?(?:px|em|rem|%)?$/],
        },
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      allowedSchemesByTag: {
        img: ['http', 'https', 'data'],
      },
      // Remove script tags and event handlers
      disallowedTagsMode: 'discard',
      // Remove dangerous attributes
      enforceHtmlBoundary: true,
    });

    return sanitized;
  }
}
