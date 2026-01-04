import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonService } from '@shared/services/common.service';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatCardModule,
  ],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
})
export class ForgetPasswordComponent {
  forgetPasswordForm: FormGroup;
  isLoading = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private commonService: CommonService,
    private router: Router
  ) {
    this.forgetPasswordForm = this.fb.group({
      emailOrUsername: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.forgetPasswordForm.valid && !this.emailSent) {
      this.isLoading = true;
      const { emailOrUsername } = this.forgetPasswordForm.value;

      this.commonService.requestPasswordReset(emailOrUsername).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.emailSent = true;
          this.snackBar.open(
            response.message || 'Password reset link has been sent to your email',
            'Close',
            { duration: 5000 }
          );
        },
        error: (err: any) => {
          this.isLoading = false;
          this.snackBar.open(
            err.error?.message || 'Failed to send reset link. Please try again.',
            'Close',
            { duration: 3000 }
          );
        },
      });
    }
  }

  onCancel() {
    this.forgetPasswordForm.reset();
    this.router.navigate(['/login']);
  }

  onBackToLogin() {
    this.router.navigate(['/login']);
  }
}
