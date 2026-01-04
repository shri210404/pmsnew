import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'dashbaord-ui';

  ngOnInit(): void {
    // Validate environment configuration on app startup
    this.validateEnvironment();
  }

  /**
   * Validate environment configuration
   * Ensures required environment variables are set
   */
  private validateEnvironment(): void {
    const errors: string[] = [];

    if (!environment.apiUrl) {
      errors.push('apiUrl is not defined in environment configuration');
    } else if (!this.isValidUrl(environment.apiUrl)) {
      errors.push(`apiUrl is not a valid URL: ${environment.apiUrl}`);
    }

    if (!environment.frontendUrl) {
      errors.push('frontendUrl is not defined in environment configuration');
    } else if (!this.isValidUrl(environment.frontendUrl)) {
      errors.push(`frontendUrl is not a valid URL: ${environment.frontendUrl}`);
    }

    if (errors.length > 0) {
      const errorMessage = `Environment Configuration Errors:\n${errors.join('\n')}`;
      console.error(errorMessage);
      
      // In production, you might want to show a user-friendly error
      if (environment.production) {
        alert('Application configuration error. Please contact support.');
      }
    } else {
      console.log('Environment validated successfully:', {
        production: environment.production,
        apiUrl: environment.apiUrl,
        frontendUrl: environment.frontendUrl,
      });
    }
  }

  /**
   * Basic URL validation
   */
  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
