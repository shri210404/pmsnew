import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '@shared/services/common.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    ReactiveFormsModule
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private commonService: CommonService,
    private snackBar: MatSnackBar  // Inject MatSnackBar here
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, this.emailDomainValidator]],
      password: ['', [Validators.required, Validators.minLength(6), this.passwordValidator]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
    });
  }

  passwordValidator(control: any) {
    const password = control.value;
    // Updated regex pattern to include special characters and minimum length of 8
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  
    if (!passwordPattern.test(password)) {
      return { invalidPassword: true }; // Return error if the pattern doesn't match
    }
    return null; // Return null if the password is valid
  }
  
  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  emailDomainValidator(control: any) {
    const email = control.value;
    if (email && email.indexOf('@') != -1) {
      const [_, domain] = email.split('@');
      if (domain !== 'mindpec.com') {
        return { invalidDomain: true };
      }
    }
    return null;
  }

  passwordsMatch(): boolean {
    return this.registerForm.get('password')?.value === this.registerForm.get('confirmPassword')?.value;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const registerPayload = {
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        username: this.registerForm.value.username,
        password: this.registerForm.value.password,
        email: this.registerForm.value.email,
      };

      this.commonService.register(registerPayload).subscribe(
        (resp) => {
          if (resp) {
            // Show success message with snackbar
            this.snackBar.open('Successfully Registered, Please login using credentials', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']  // Optional: custom style for success
            });
            this.router.navigate(['/login']);
          }
        },
        (error) => {
          // Handle registration error
          console.error('Registration failed', error);
          const errorMessage = error?.error?.message || 'An error occurred. Please try again.';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']  // Optional: custom style for error
          });
        }
      );
    } else {
      // Handle invalid form
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  login() {
    this.router.navigate(['/login']);
  }

  get f() {
    return this.registerForm.controls;
  }
}
