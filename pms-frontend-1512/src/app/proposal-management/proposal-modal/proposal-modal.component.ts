import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@shared/services/common.service';
import { ProposalManagementService } from '../services/proposal-management.service';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@shared/base/base.component';

@Component({
  selector: 'app-proposal-modal',
  templateUrl: './proposal-modal.component.html',
  styleUrls: ['./proposal-modal.component.scss'],
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, CommonModule, ReactiveFormsModule]
})
export class ProposalModalComponent extends BaseComponent implements OnInit {
  proposalForm: FormGroup;
  selectedFile: File | null = null;
  attachmentFileName: string = '';
  mode: 'view' | 'edit' = 'edit';
  proposalData: any = {};

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<ProposalModalComponent>,
    private commonService: CommonService,
    private proposalService:ProposalManagementService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    super();
    this.proposalForm = this.fb.group({});
    // Extract mode from data, default to 'edit'
    this.mode = data.mode || 'edit';
    // Store proposal data without mode
    const { mode, ...proposal } = data;
    this.proposalData = proposal;
  }

  ngOnInit(): void {
    try {
      console.log('ProposalModalComponent ngOnInit - mode:', this.mode, 'data:', this.proposalData);
      
      // Dynamically create form fields based on proposal data
      if (!this.proposalData || Object.keys(this.proposalData).length === 0) {
        console.warn('No proposal data provided to modal');
        return;
      }

      Object.keys(this.proposalData).forEach(key => {
        // Skip 'mode' and 'id' for form controls (id is handled separately)
        if (key !== 'mode' && key !== 'id') {
          const control = this.fb.control({
            value: this.proposalData[key],
            disabled: this.mode === 'view' // Disable in view mode
          });
          this.proposalForm.addControl(key, control);
        }
        
        // If there is an attachment, set the file name
        if (key === 'attachment' && this.proposalData[key]) {
          this.attachmentFileName = this.proposalData[key];
        }
      });
    } catch (error) {
      console.error('Error in ProposalModalComponent ngOnInit:', error);
      // Close dialog on error to prevent hanging
      this.dialogRef.close();
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.attachmentFileName = this.selectedFile.name; // Update the file name in the UI
    }
  }

  onSave(): void {
    if (this.mode === 'view') {
      // In view mode, just close the dialog
      this.dialogRef.close();
      return;
    }

    // Get form values (including disabled fields)
    const formData = this.proposalForm.getRawValue();
    const proposalId = this.proposalData['id'] || this.data['id'];

    // If a new file was selected, include it in the save operation
    if (this.selectedFile) {
      const uploadData = new FormData();
      uploadData.append('file', this.selectedFile);
      
      // Append other form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'attachment' && formData[key] !== null && formData[key] !== undefined) {
          uploadData.append(key, formData[key]);
        }
      });

      this.proposalService.updateProposal(proposalId, uploadData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (resp) => {
            this.dialogRef.close(resp); // Close with response data
          },
          error: (err) => {
            console.error('Error updating proposal:', err);
            // Keep dialog open on error so user can retry
          }
        });
    } else {
      // No file change, update with form data
      this.proposalService.updateProposal(proposalId, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (resp) => {
            this.dialogRef.close(resp); // Close with response data
          },
          error: (err) => {
            console.error('Error updating proposal:', err);
            // Keep dialog open on error so user can retry
          }
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
