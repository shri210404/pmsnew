import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table'; // Import Material Table
import { CommonService } from '@shared/services/common.service';

@Component({
  selector: 'app-email-checker',
  standalone: true,
  templateUrl: './email-checker.component.html',
  styleUrls: ['./email-checker.component.scss'],
  imports: [
    // Import necessary Angular Material components
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    CommonModule,
    MatTableModule  // Import Material Table module
  ]
})
export class EmailCheckerComponent {
  emailForm: FormGroup;
  emailStatus: string | null = null;
  displayedColumns: string[] = ['name', 'client','role', 'submissionDate', 'status']; // Columns for the table
  emailData: any[] = [];  // Array to store email data for display in table

  // Inject services
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private commonService = inject(CommonService);

  constructor() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // Search function to check if email exists in the database (proposals)
  checkEmail(): void {
    const email = this.emailForm.get('email')?.value;

    if (email) {
      this.commonService.duplicateCheck(email).subscribe(
        (response) => {
          // Clear previous results before showing new data
          this.emailData = [];

          // Check if the response is an object (existing profile)
          if (response && response.length > 0) {
            this.emailStatus = 'Profile is already submitted.';
            this.snackBar.open(this.emailStatus, 'Close', { duration: 3000 });
            response.forEach((response:any)=>{
              this.emailData.push({
              name: response.candidateName,
              client: response.clientName,
              role:response.roleApplied,
              submissionDate: response.createdAt,
              status: response.submittedStatus
              
            });
            })
        
            // If response is null (email not found in the system)
          } else if (response === null) {
            this.emailStatus = 'Record  Not Found.';
            this.snackBar.open(this.emailStatus, 'Close', { duration: 3000 });

            // If the response is an empty array (no duplicate profiles found)
          } else if (Array.isArray(response) && response.length === 0) {
            this.emailStatus = 'Record Not Found.';
            this.snackBar.open(this.emailStatus, 'Close', { duration: 3000 });

            // If any other condition arises (for debugging or unexpected responses)
          } else {
            this.emailStatus = 'Unexpected response from server.';
            this.snackBar.open(this.emailStatus, 'Close', { duration: 3000 });
          }
        },
        (error) => {
          this.emailStatus = 'Error checking email.';
          this.snackBar.open(this.emailStatus, 'Close', { duration: 3000 });
        }
      );
    }
  }
}
