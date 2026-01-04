import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@shared/services/common.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatCardModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = false;
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.snackBar.open('Invalid or missing reset token', 'Close', {
          duration: 3000,
        });
        setTimeout(() => {
          this.router.navigate(['/forget-password']);
        }, 2000);
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    if (this.resetPasswordForm.valid && this.token) {
      this.isLoading = true;
      const { password } = this.resetPasswordForm.value;

      this.commonService.resetPassword(this.token, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open(
            response.message || 'Password reset successfully',
            'Close',
            { duration: 3000 }
          );

          // Redirect to login after 1 second
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1000);
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(
            err.error?.message || 'Failed to reset password. Please try again.',
            'Close',
            { duration: 3000 }
          );
        },
      });
    }
  }

  onCancel() {
    this.router.navigate(['/login']);
  }
}

