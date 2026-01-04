import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonService } from '@shared/services/common.service';
import { JobOrderService } from './job-order.service';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@shared/base/base.component';

@Component({
  selector: 'app-job-order-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    RouterModule,
    
  ],
  templateUrl: './job-order-create.component.html',
  styleUrls: ['./job-order-create.component.scss'],
})
export class JobOrderCreateComponent extends BaseComponent implements OnInit {
  jobOrderForm!: FormGroup;
  selectedFile: File | null = null;
  attachmentFileName: string = '';
  attachmentUrl: string = '';
  isSubmitting = false;
  accountDetails: any;
  mode: 'create' | 'edit' | 'view' = 'create';
  jobOrderId: string | null = null;

  // Dropdown options
  clients: any[] = [];
  locations: any[] = [];
  languages: any[] = [];
  employees: any[] = [];
  filteredClients: any[] = [];
  clientSearchTerm: string = '';

  // Static options
  clientTypes = ['IT', 'BPO'];
  workTypes = ['Remote', 'Hybrid', 'Onsite'];
  contractTypes = ['Permanent', 'Contract'];
  shiftOptions = ['Yes', 'No'];
  statusOptions = ['Open', 'Closed', 'WIP', 'Cancelled'];
  visaOptions = ['Yes', 'No'];

  // Candidate statistics
  candidateStats: {
    submitted: number;
    proposed: number;
    selected: number;
    joined: number;
    rejected: number;
  } | null = null;
  isLoadingStats = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private jobOrderService: JobOrderService,
    private snackBar: MatSnackBar
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadDropdownData();
    this.loadAccountDetails();
    
    // Check if we're in edit or view mode
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params['data']) {
          const data = JSON.parse(params['data']);
          this.mode = data.viewMode ? 'view' : data.editMode ? 'edit' : 'create';
          this.jobOrderId = data.id;
          
          if (this.mode === 'edit' || this.mode === 'view') {
            this.loadJobOrder(this.jobOrderId!);
          } else {
            // Load next Job ID from backend
            this.loadNextJobId();
          }
        } else {
          // Load next Job ID from backend
          this.loadNextJobId();
        }
      });
  }

  initializeForm(): void {
    this.jobOrderForm = this.fb.group({
      jobId: [{ value: '', disabled: true }],
      clientName: ['', Validators.required],
      clientType: ['', Validators.required],
      jobTitle: ['', Validators.required],
      jobDescriptionSummary: ['', Validators.required],
      workLocationCountry: ['', Validators.required],
      remoteHybridOnsite: ['', Validators.required],
      jobStartDate: ['', Validators.required],
      jobEndDate: ['', Validators.required],
      contractType: ['', Validators.required],
      numberOfPositions: ['', [Validators.required, Validators.min(1)]],
      requiredSkills: [''],
      yearsOfExperience: [''],
      minEducationalQualification: [''],
      salaryCtcRange: ['', Validators.required],
      shift: [''],
      shiftTiming: [''],
      languageRequirement: [[]],
      languageProficiencyLevel: [''],
      nationalityPreference: [[]],
      visaWorkPermitProvided: [''],
      clientSpocName: ['', Validators.required],
      internalRecruiterAssigned: [[]],
      remarksNotes: [''],
      detailedJdAttachment: [''],
      jobOwner: ['', Validators.required],
      deliveryLead: ['', Validators.required],
      status: ['Open', Validators.required],
    });
  }

  loadNextJobId(): void {
    this.jobOrderService.getNextJobId()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response?.jobId) {
            this.jobOrderForm.patchValue({ jobId: response.jobId });
          }
        },
        error: (err) => {
          console.error('Error loading next Job ID:', err);
          // Fallback to placeholder if API fails
          this.jobOrderForm.patchValue({ jobId: 'Auto-generated...' });
        },
      });
  }

  loadJobOrder(id: string): void {
    this.jobOrderService.getJobOrderById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (data: any) => {
        // Format dates for the form
        const jobStartDate = data.jobStartDate ? new Date(data.jobStartDate) : null;
        const jobEndDate = data.jobEndDate ? new Date(data.jobEndDate) : null;
        
        this.jobOrderForm.patchValue({
          jobId: data.jobId,
          clientName: data.clientName,
          clientType: data.clientType,
          jobTitle: data.jobTitle,
          jobDescriptionSummary: data.jobDescriptionSummary,
          workLocationCountry: data.workLocationCountry,
          remoteHybridOnsite: data.remoteHybridOnsite,
          jobStartDate: jobStartDate,
          jobEndDate: jobEndDate,
          contractType: data.contractType,
          numberOfPositions: data.numberOfPositions,
          requiredSkills: data.requiredSkills,
          yearsOfExperience: data.yearsOfExperience,
          minEducationalQualification: data.minEducationalQualification,
          salaryCtcRange: data.salaryCtcRange,
          shift: data.shift,
          shiftTiming: data.shiftTiming,
          languageRequirement: Array.isArray(data.languageRequirement)
            ? data.languageRequirement
            : (data.languageRequirement ? String(data.languageRequirement).split(',').map((s: string) => s.trim()) : []),
          languageProficiencyLevel: data.languageProficiencyLevel,
          nationalityPreference: Array.isArray(data.nationalityPreference)
            ? data.nationalityPreference
            : (data.nationalityPreference ? String(data.nationalityPreference).split(',').map((s: string) => s.trim()) : []),
          visaWorkPermitProvided: data.visaWorkPermitProvided,
          clientSpocName: data.clientSpocName,
          internalRecruiterAssigned: Array.isArray(data.internalRecruiterAssigned)
            ? data.internalRecruiterAssigned
            : (data.internalRecruiterAssigned ? String(data.internalRecruiterAssigned).split(',').map((s: string) => s.trim()) : []),
          remarksNotes: data.remarksNotes,
          jobOwner: data.jobOwner,
          deliveryLead: data.deliveryLead,
          status: data.status,
        });
        
        if (data.detailedJdAttachment) {
          this.attachmentFileName = data.detailedJdAttachment.split('/').pop() || 'File attached';
          this.attachmentUrl = data.detailedJdAttachment;
        }
        
        // Disable form in view mode
        if (this.mode === 'view') {
          this.jobOrderForm.disable();
          // Load candidate statistics in view mode
          this.loadCandidateStatistics(id);
        }
      },
      error: (err: any) => {
        console.error('Error loading job order:', err);
        this.snackBar.open('Error loading job order', 'Close', { duration: 3000 });
        this.router.navigate(['/app/job-order']);
      },
    });
  }

  loadAccountDetails(): void {
    const accountDetailsStr = localStorage.getItem('account-details');
    if (accountDetailsStr) {
      this.accountDetails = JSON.parse(accountDetailsStr).userdetails;
    }
  }

  loadDropdownData(): void {
    // Load clients
    this.commonService.getClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.clients = data.sort((a: any, b: any) => a.clientName.localeCompare(b.clientName));
          this.filteredClients = this.clients;
        },
        error: (err) => {
          console.error('Error loading clients:', err);
        },
      });

    // Load countries
    this.commonService.getCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.locations = data;
        },
        error: (err) => {
          console.error('Error loading countries:', err);
        },
      });

    // Load languages
    this.commonService.getLanguage()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.languages = data;
        },
        error: (err) => {
          console.error('Error loading languages:', err);
        },
      });

    // Load employees (for job owner, delivery lead, recruiter)
    this.commonService.getAllEmployee()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.employees = data;
        },
        error: (err) => {
          console.error('Error loading employees:', err);
        },
      });
  }

  onClientSearch(term: string): void {
    this.clientSearchTerm = term || '';
    const search = this.clientSearchTerm.toLowerCase();
    this.filteredClients = this.clients.filter((c: any) =>
      c.clientName.toLowerCase().includes(search)
    );
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.attachmentFileName = file.name;
      this.jobOrderForm.patchValue({ detailedJdAttachment: file.name });
    }
  }

  onSave(): void {
    if (this.jobOrderForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formData = new FormData();
      const formValue = this.jobOrderForm.getRawValue();

      // Add all form fields to FormData (excluding jobId as it's generated by backend)
      Object.keys(formValue).forEach((key) => {
        if (key !== 'detailedJdAttachment' && key !== 'jobId') {
          if (formValue[key] !== null && formValue[key] !== undefined) {
            formData.append(key, formValue[key]);
          }
        }
      });

      // Normalize multi-select fields to comma-separated strings
      if (Array.isArray(formValue.languageRequirement)) {
        formData.set('languageRequirement', formValue.languageRequirement.join(', '));
      }
      if (Array.isArray(formValue.nationalityPreference)) {
        formData.set('nationalityPreference', formValue.nationalityPreference.join(', '));
      }
      if (Array.isArray(formValue.internalRecruiterAssigned)) {
        formData.set('internalRecruiterAssigned', formValue.internalRecruiterAssigned.join(', '));
      }

      // Add file if selected (only required for create mode)
      if (this.selectedFile) {
        formData.append('file', this.selectedFile, this.selectedFile.name);
        formData.append('detailedJdAttachment', this.selectedFile.name);
      } else if (this.mode === 'create') {
        this.snackBar.open('JD Attachment is required', 'Close', { duration: 3000 });
        this.isSubmitting = false;
        return;
      }

      // Convert dates to ISO string
      if (formValue.jobStartDate) {
        formData.set('jobStartDate', new Date(formValue.jobStartDate).toISOString());
      }
      if (formValue.jobEndDate) {
        formData.set('jobEndDate', new Date(formValue.jobEndDate).toISOString());
      }

      // Add createdBy (user ID) for create, updatedBy for edit
      if (this.accountDetails && this.accountDetails.id) {
        if (this.mode === 'edit') {
          formData.set('updatedBy', this.accountDetails.id);
        } else {
          formData.set('createdBy', this.accountDetails.id);
        }
      }

      if (this.mode === 'edit' && this.jobOrderId) {
        // Update existing job order
        this.jobOrderService.updateJobOrder(this.jobOrderId, formData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.snackBar.open('Job Order updated successfully', 'Close', { duration: 3000 });
              this.isSubmitting = false;
              this.router.navigate(['/app/job-order']);
            },
            error: (err) => {
              this.snackBar.open(
                err.error?.message || 'Failed to update job order',
                'Close',
                { duration: 3000 }
              );
              this.isSubmitting = false;
            },
          });
      } else {
        // Create new job order
        this.jobOrderService.createJobOrder(formData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              console.log('Job order created successfully:', response);
              const jobId = response?.jobId || 'Job Order';
              this.snackBar.open(`Job Order ${jobId} created successfully`, 'Close', { duration: 3000 });
              this.isSubmitting = false;
              
              // Navigate to job order list
              console.log('Navigating to /app/job-order');
              this.router.navigate(['/app/job-order']).then(
                (success) => {
                  if (success) {
                    console.log('Navigation to job-order list successful');
                  } else {
                    console.error('Navigation to job-order list failed - may have been blocked by guard');
                    // Stay on current page if navigation fails
                  }
                }
              ).catch((error) => {
                console.error('Navigation error:', error);
              });
            },
            error: (err) => {
              console.error('Error creating job order:', err);
              this.snackBar.open(
                err.error?.message || 'Failed to create job order',
                'Close',
                { duration: 3000 }
              );
              this.isSubmitting = false;
            },
          });
      }
    } else {
      this.markFormGroupTouched(this.jobOrderForm);
    }
  }

  onCancel(): void {
    this.router.navigate(['/app/job-order']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  loadCandidateStatistics(jobOrderId: string): void {
    this.isLoadingStats = true;
    this.jobOrderService.getCandidateStatistics(jobOrderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.candidateStats = stats;
          this.isLoadingStats = false;
        },
        error: (err) => {
          console.error('Error loading candidate statistics:', err);
          this.isLoadingStats = false;
        },
      });
  }
}
