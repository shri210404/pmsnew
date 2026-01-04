import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { CommonService } from '@shared/services/common.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VersionService } from '@shared/services/version.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  version: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private commonService: CommonService,
    private snackBar: MatSnackBar,  // Inject MatSnackBar here
    private versionService: VersionService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
    this.version = versionService.version;
  }

  register() {
    this.router.navigateByUrl("/register");
  }

  forgetPassword(event:Event){
    event.stopPropagation();
    this.router.navigateByUrl("/forget-password");
  }

  onSubmit() {
    if (this.loginForm.valid) {
      // Disable form during submission
      this.loginForm.disable();
      const credentials = this.loginForm.value;
      const payload = {
        'username': credentials.email,
        'secret': credentials.password
      };
  
      console.log('Attempting login...');
      console.log('Login payload:', payload);
      const loginStartTime = Date.now();
      this.commonService.submitLogin(payload).subscribe({
        next: (response: any) => {
          const loginDuration = Date.now() - loginStartTime;
          console.log(`Login response received after ${loginDuration}ms:`, response);
          console.log('Response has authToken:', !!response?.authToken);
          console.log('Response has userdetails:', !!response?.userdetails);
          if (response && response.authToken) {
            // Store account details in localStorage
            try {
              localStorage.setItem('account-details', JSON.stringify(response));
              console.log('Account details stored successfully');
              
              // Decode token to log expiry info
              try {
                const tokenParts = response.authToken.split('.');
                if (tokenParts.length === 3) {
                  const payload = JSON.parse(atob(tokenParts[1]));
                  const expiryTime = payload.exp ? new Date(payload.exp * 1000).toISOString() : 'unknown';
                  const timeUntilExpiry = payload.exp ? (payload.exp * 1000 - Date.now()) : null;
                  console.log('Token info:', {
                    expiryTime,
                    timeUntilExpiry: timeUntilExpiry ? `${Math.round(timeUntilExpiry / 1000)}s` : 'unknown',
                    userId: payload.id,
                    username: payload.username
                  });
                }
              } catch (e) {
                console.warn('Could not decode token:', e);
              }
              
              console.log('Navigating to /app/dashboard...');
              const navStartTime = Date.now();
              // Navigate immediately - AuthGuard will handle validation
              this.router.navigate(['/app/dashboard']).then(
                (success) => {
                  const navDuration = Date.now() - navStartTime;
                  if (success) {
                    console.log(`Navigation successful after ${navDuration}ms`);
                    // Show success message after navigation
                    const successMessage = response.message || 'Login successful';
                    this.snackBar.open(successMessage, 'Close', {
                      duration: 3000,
                      panelClass: ['success-snackbar']
                    });
                  } else {
                    console.error(`Navigation returned false after ${navDuration}ms - AuthGuard may have blocked it`);
                    this.snackBar.open('Navigation failed. Please check console for details.', 'Close', {
                      duration: 5000,
                      panelClass: ['error-snackbar']
                    });
                  }
                  this.loginForm.enable();
                }
              ).catch((error) => {
                const navDuration = Date.now() - navStartTime;
                console.error(`Navigation error after ${navDuration}ms:`, error);
                this.snackBar.open('Navigation error occurred. Please try again.', 'Close', {
                  duration: 5000,
                  panelClass: ['error-snackbar']
                });
                this.loginForm.enable();
              });
            } catch (storageError) {
              console.error('Error storing account details:', storageError);
              this.snackBar.open('Error saving login information. Please try again.', 'Close', {
                duration: 3000,
                panelClass: ['error-snackbar']
              });
              this.loginForm.enable();
            }
          } else {
            // Invalid credentials Snackbar
            console.warn('Login response missing authToken:', response);
            this.snackBar.open(response?.message || 'Invalid credentials', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
            this.loginForm.enable();
          }
        },
        error: (error) => {
          // Handle HTTP errors here
          console.error('Login request failed:', error);
          let errorMessage = 'An error occurred. Please try again.';
          
          if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (error?.status === 0) {
            errorMessage = 'Unable to connect to server. Please check your connection.';
          } else if (error?.status === 401) {
            errorMessage = 'Invalid username or password.';
          } else if (error?.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
          
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.loginForm.enable();
        }
      });
    }
  }
  
}
