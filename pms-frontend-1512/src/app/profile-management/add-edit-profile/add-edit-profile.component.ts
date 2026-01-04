import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDialogContent } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ProposalManagementService } from 'src/app/proposal-management/services/proposal-management.service';
import { CommonService } from '@shared/services/common.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { JobOrderService } from 'src/app/job-order/job-order.service';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@shared/base/base.component';

@Component({
  selector: 'app-add-edit-profile',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatButtonModule,
    CommonModule,
    MatTableModule,
    FormsModule,
    MatTabsModule,
    MatDialogContent,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './add-edit-profile.component.html',
  styleUrls: ['./add-edit-profile.component.scss'],
})
export class AddEditProfileComponent extends BaseComponent implements OnInit {
  @Input() profileData: any = null;
  attachmentFileName: string = '';
  profileForm!: FormGroup;
  selectedFile: File | null = null;
  accountDetails: any;
  proposedTo: string = '';
  editData: any;
  mode: string = 'add'; // Set default mode to 'add' for new profile
  locations: any;
  clients: any;
  jobOrders: any[] = [];
  filteredJobOrders: any[] = [];
  private snackBar = inject(MatSnackBar);
  isSubmit: any;
  selectionDate: any;
  joiningDate: any;
  proposalDate: any;
  rejection_dropped_Date: any;
  invoiceDate: any;
  isBusinessHead: any;
  createdById: any;
  language: any;
  currency: any;
  previousStatus: any;
  HRM: boolean = false;
  isSubmitting = false;
  submittedStatus = [
    { value: 'SUBMITTED', display: 'SUBMITTED' },
    { value: 'PROPOSED', display: 'PROPOSED' },
    { value: 'ROLE_HOLD', display: 'ROLE-HOLD' },
    { value: 'ROLE_CLOSED', display: 'ROLE-CLOSED' },
    { value: 'REJECTED_INTERNAL', display: 'REJECTED-INTERNAL' },
    { value: 'REJECTED_CLIENT', display: 'REJECTED-CLIENT' },
    { value: 'SELECTED', display: 'SELECTED' },
    { value: 'JOINED', display: 'JOINED' },
    { value: 'DROPPED_CLIENT', display: 'DROPPED-CLIENT' },
    { value: 'DROPPED_INTERNAL', display: 'DROPPED-CANDIDATE' },
    { value: 'PENDING_SUBMISSION', display: 'PENDING-SUBMISSION' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private proposalService: ProposalManagementService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private http: HttpClient,
    private jobOrderService: JobOrderService
  ) {
    super();
    this.isSubmit = false;
  }

  ngOnInit(): void {
    // Initialize the form before anything else
    this.profileForm = this.fb.group({
      candidateName: ['', Validators.required],
      location: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      clientName: ['', Validators.required],
      roleApplied: ['', Validators.required],
      nationality: [''],
      jobLanguage: [''],
      educationLevel: [''],
      currentSalary: [''],
      nativeLanguage: [''],
      submittedStatus: ['SUBMITTED'],
      contact: [''],
      noticePeriod: [''],
      remarks: [''],
      // primarySkills: [''],
      billingNo: [''],
      billingCurrency: [''],
      selectionDate: [''],
      joiningDate: [''],
      proposalDate: [''],
      rejection_dropped_Date: [''],
      invoiceNo: [''],
      invoiceDate: [''],
      salaryCurrency: [''],
      jobOrderId: [''],
    });

    this.loadCountries();
    this.loadClients();
    this.loadCurrency();
    this.loadLanguage();
    this.loadJobOrders();

    // Listen to clientName changes to filter job orders
    this.profileForm.get('clientName')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((clientName) => {
        this.onClientChange(clientName);
      });

    // Retrieve account details from localStorage (if needed)
    this.accountDetails = localStorage.getItem('account-details');
    if (this.accountDetails) {
      this.accountDetails = JSON.parse(this.accountDetails).userdetails;
    }
    const allowedRoles = ['Business Head', 'Admin', 'Finance Manager'];
    this.isBusinessHead = allowedRoles.includes(this.accountDetails.role);
    if (this.accountDetails.role === 'HR Manager') {
      this.HRM = true;
    }

    // Retrieve queryParams from route and handle the modes
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params['data']) {
          this.profileData = JSON.parse(params['data']);

          this.proposalService
            .getProposalById(this.profileData.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe((resp) => {
            this.isSubmit = this.profileData['isSubmission'];
            this.previousStatus = resp['submittedStatus'];

            this.createdById = resp['createdById'];
            // Check if it's edit or view mode based on the flags
            if (this.profileData['editMode']) {
              this.mode = 'edit'; // Set to edit mode
            } else if (this.profileData['viewMode']) {
              this.mode = 'view'; // Set to view mode
            }
            // Patch form values if in edit mode
            if (this.mode === 'edit' || this.mode === 'view') {
              const formattedResp = {
                ...resp,
                selectionDate: resp['selectionDate']
                  ? new Date(resp['selectionDate'])
                  : null,
                joiningDate: resp['joiningDate']
                  ? new Date(resp['joiningDate'])
                  : null,
                invoiceDate: resp['invoiceDate']
                  ? new Date(resp['invoiceDate'])
                  : null,
                rejection_dropped_Date: resp['rejection_dropped_Date']
                  ? new Date(resp['rejection_dropped_Date'])
                  : null,
              };

              this.profileForm.patchValue(formattedResp);

              // If jobOrderId exists, filter job orders by client and set the value
              if (resp['jobOrderId'] && resp['clientName']) {
                this.onClientChange(resp['clientName']);
                // Wait a bit for the filtered list to populate, then set the jobOrderId
                setTimeout(() => {
                  this.profileForm.patchValue({ jobOrderId: resp['jobOrderId'] });
                }, 100);
              }

              // Assign to the local variables for two-way binding
              this.selectionDate = formattedResp.selectionDate;
              this.joiningDate = formattedResp.joiningDate;
              this.invoiceDate = formattedResp.invoiceDate;
              this.rejection_dropped_Date =
                formattedResp.rejection_dropped_Date;

              // For file name, we handle it separately because <input type="file"> cannot be pre-filled
              if (resp['attachment']) {
                this.attachmentFileName = resp['attachment'].split('/').pop();
              }
            }
          });
      }
    });
  }

  loadCountries(): void {
    this.commonService.getCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data.length > 0) {
          this.locations = data.sort((a: any, b: any) =>
            a.countryName.localeCompare(b.countryName)
          );
        }
      });
  }

  loadClients(): void {
    this.commonService.getClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data.length > 0) {
          this.clients = data.sort((a: any, b: any) =>
            a.clientName.localeCompare(b.clientName)
          );
        }
      });
  }

  loadCurrency(): void {
    this.commonService.getCurrency()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data.length > 0) {
          this.currency = data.sort((a: any, b: any) =>
            a.currencyName.localeCompare(b.currencyName)
          );
        }
        this.currency = data;
      });
  }

  loadLanguage(): void {
    this.commonService.getLanguage()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data.length > 0) {
          this.language = data.sort((a: any, b: any) =>
            a.languageName.localeCompare(b.languageName)
          );
        }
        this.language = data;
      });
  }

  loadJobOrders(): void {
    this.jobOrderService.getAllJobOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.jobOrders = data || [];
          // If a client is already selected, filter job orders
          const selectedClient = this.profileForm.get('clientName')?.value;
        if (selectedClient) {
          this.onClientChange(selectedClient);
        }
      },
      error: (err) => {
        console.error('Error loading job orders:', err);
      },
    });
  }

  onClientChange(clientName: string): void {
    if (clientName) {
      // Filter job orders by client name
      this.filteredJobOrders = this.jobOrders.filter(
        (jobOrder) => jobOrder.clientName === clientName
      );
      // Reset job order selection when client changes
      this.profileForm.patchValue({ jobOrderId: '' });
    } else {
      this.filteredJobOrders = [];
      this.profileForm.patchValue({ jobOrderId: '' });
    }
  }

  // onSave(): void {
  //   if (this.profileForm.valid) {
  //     const profile = this.profileForm.value;

  //     // Prepare submission data with empty strings for unselected dates
  //     const submissionData = {
  //       ...profile,
  //       createdBy: this.createdById ? this.createdById : this.accountDetails.id,
  //       proposedTo: this.proposedTo,
  //     };

  //     // Handle date fields to send empty string if not selected
  //     const dateFields = [
  //       'proposalDate',
  //       'selectionDate',
  //       'joiningDate',
  //       'invoiceDate',
  //       'rejection_dropped_Date'
  //     ];
  //     dateFields.forEach((field) => {
  //       if (submissionData[field]) {
  //         submissionData[field] = new Date(submissionData[field]).toISOString(); // Convert to ISO-8601 format if date is present
  //       } else {
  //         delete submissionData[field]; // Delete the field if date is not selected
  //       }
  //     });

  //     // Create FormData object
  //     const formPayload = new FormData();

  //     if (this.mode === 'edit' && this.profileData && this.profileData.id)
  //       submissionData['updatedBy'] = this.accountDetails.id;

  //     // Append data from submissionData to the formPayload
  //     Object.keys(submissionData).forEach((keyName) => {
  //       formPayload.append(keyName, submissionData[keyName]);
  //     });

  //     // Check if the file is selected
  //     if (this.selectedFile) {
  //       // Append the selected file to the formPayload
  //       formPayload.append('file', this.selectedFile, this.selectedFile.name); // Include file name if needed

  //     } else {

  //     }

  //     // Check if mode is 'edit' and call the appropriate API
  //     if (this.mode === 'edit' && this.profileData && this.profileData.id) {
  //       const id = this.profileData.id;
  //       formPayload.append('previousStatus',this.previousStatus);
  //       this.proposalService.updateProposal(id, formPayload).subscribe(
  //         (resp) => {

  //           this.snackBar.open('Proposal updated successfully:', 'Close', {
  //             duration: 3000,
  //           });
  //           if(this.isSubmit){
  //             this.router.navigateByUrl("/app/submission");
  //           }else{
  //             this.router.navigateByUrl('/app/proposal');           }
  //         },
  //         (error) => {
  //           console.error('Error updating proposal:', error);
  //           this.snackBar.open('Error updating proposal', 'Close', {
  //             duration: 3000,
  //           });
  //         }
  //       );
  //     } else {
  //       // Call saveProposal if not in edit mode
  //       this.proposalService.saveProposal(formPayload).subscribe(
  //         (resp) => {

  //           this.snackBar.open('Proposal saved successfully:', 'Close', {
  //             duration: 3000,
  //           });
  //           this.router.navigateByUrl('/app/proposal');
  //         },
  //         (error) => {

  //           this.snackBar.open('Error saving proposal', 'Close', {
  //             duration: 3000,
  //           });
  //         }
  //       );
  //     }
  //   }
  // }

  onStatusChange(selectedValue: string) {
    const today = new Date().toISOString(); // Full ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
  
    if (selectedValue === 'PROPOSED') {
      this.profileForm.patchValue({ proposalDate: today });
    } else if (selectedValue === 'SELECTED') {
      this.profileForm.patchValue({ selectionDate: today });
    } else if (selectedValue === 'JOINED') {
      this.profileForm.patchValue({ joiningDate: today });
    } else if (
      ['DROPPED_CLIENT', 'DROPPED_INTERNAL', 'REJECTED_CLIENT', 'REJECTED_INTERNAL'].includes(selectedValue)
    ) {
      this.profileForm.patchValue({ rejection_dropped_Date: today });
    }
  }
  

  onSave(): void {
    if (this.profileForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const profile = this.profileForm.value;

      const submissionData = {
        ...profile,
        createdBy: this.createdById ? this.createdById : this.accountDetails.id,
        proposedTo: this.proposedTo,
      };

      const dateFields = [
        'proposalDate',
        'selectionDate',
        'joiningDate',
        'invoiceDate',
        'rejection_dropped_Date',
      ];
      dateFields.forEach((field) => {
        if (submissionData[field]) {
          submissionData[field] = new Date(submissionData[field]).toISOString();
        } else {
          delete submissionData[field];
        }
      });

      const formPayload = new FormData();

      if (this.mode === 'edit' && this.profileData?.id) {
        submissionData['updatedBy'] = this.accountDetails.id;
      }

      Object.keys(submissionData).forEach((keyName) => {
        formPayload.append(keyName, submissionData[keyName]);
      });

      if (this.selectedFile) {
        formPayload.append('file', this.selectedFile, this.selectedFile.name);
      }

      const handleSuccess = (message: string) => {
        this.snackBar.open(message, 'Close', { duration: 3000 });
        window.close();
        const redirectPath = this.isSubmit
          ? '/app/submission'
          : '/app/proposal';
        this.router.navigateByUrl(redirectPath);
        this.isSubmitting = false;
      };

      const handleError = (message: string) => {
        console.error(message);
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.isSubmitting = false;
      };

      if (this.mode === 'edit' && this.profileData?.id) {
        const id = this.profileData.id;
        formPayload.append('previousStatus', this.previousStatus);
        this.proposalService.updateProposal(id, formPayload)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            () => handleSuccess('Proposal updated successfully'),
            () => handleError('Error updating proposal')
          );
      } else {
        this.proposalService.saveProposal(formPayload)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            () => handleSuccess('Proposal saved successfully'),
            () => handleError('Error saving proposal')
          );
      }
    }
  }

  onCancel(event: Event): void {
    event.preventDefault(); // Prevent form submission
    this.profileForm.reset();
    window.close();
    if (this.isSubmit) {
      this.router.navigateByUrl('/app/submission');
    } else {
      this.router.navigateByUrl('/app/proposal');
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.attachmentFileName = this.selectedFile.name; // Update the file name in the UI
    }
  }

  onDownload(fileKey: string): void {
    this.commonService.downloadFile(fileKey);
  }
}
