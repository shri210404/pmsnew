import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '@shared/services/common.service';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { JobOrderService } from 'src/app/job-order/job-order.service';

@Component({
  selector: 'app-future-jobs-form',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './future-jobs-form.component.html',
  styleUrls: ['./future-jobs-form.component.scss']
})
export class FutureJobsFormComponent implements OnInit{
  profileForm: FormGroup;
  languageLevels = ['Basic', 'Intermediate', 'Fluent', 'Native'];
  salaryCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD'];
  status = ['SUBMITTED', 'PROPOSED'];
  readyToRelocate = ['YES', 'NO'];
  noticePeriods = ['Immediate', '15 days', '1 month', '2 months', '3 months', 'More than 3 months'];
  accountDetails: any;
  createdById: any;
  passedData: any;
  locations: any;
  clients: any;
  currency: any;
  language: any;
  isEditMode: any;
  recordId: any;
  attachmentFileName: string = '';
  jobOrders: any[] = [];
  filteredJobOrders: any[] = [];
  filteredClients: any[] = [];
  clientSearchTerm: string = '';
  constructor(
    private fb: FormBuilder,
    private commonService:CommonService,
    private router:Router,
    private jobOrderService: JobOrderService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', Validators.required],
      jobSkill: [''],
      jobRole: [''],
      location: ['', Validators.required],
      readyToRelocate: [''],
      nationality: [[]],
      nativeLanguage: [''],
      jobLanguage: [[]],
      languageLevel: [''],
      noticePeriod: [''],
      salary: [''],
      salaryCurrency: ['',],
      profileForClient: ['', Validators.required],
      profileForJobRole: [''],
      jobOrderId: ['', Validators.required],
      currentCompany: [''],
      education: [''],
      totalYearOfExp: [''],
      profileSource: [''],
      profileSourceLink: [''],
      availabilityDate: [''],
      recruiterNotes: [''],
      // lastUpdate: [''],
      status: [''],
      resume: [null, Validators.required]
    });

    this.passedData = this.router.getCurrentNavigation()?.extras.state?.['data'];

    this.loadCountries();
    this.loadClients();
    this.loadCurrency();
    this.loadLanguage();
    this.loadJobOrders();

    // Listen to profileForClient changes to filter job orders
    this.profileForm.get('profileForClient')?.valueChanges.subscribe((clientName) => {
      this.onClientChange(clientName);
    });
  }

  ngOnInit(): void {
    
    this.accountDetails = localStorage.getItem('account-details');
    if (this.accountDetails) {
      this.accountDetails = JSON.parse(this.accountDetails).userdetails;
      this.createdById = this.accountDetails.id
    }
    if(this.passedData !=null && this.passedData.action =='view' || this.passedData.action=='edit'){
      this.profileForm.patchValue(this.passedData);
      if (this.passedData['resume']) {
        this.attachmentFileName = this.passedData['resume'].split('/').pop();
      }
      if (this.passedData['jobLanguage']) {
        const jl = this.passedData['jobLanguage'];
        this.profileForm.patchValue({
          jobLanguage: Array.isArray(jl) ? jl : String(jl).split(',').map((s: string) => s.trim()).filter(Boolean)
        });
      }
      if (this.passedData['nationality']) {
        const nat = this.passedData['nationality'];
        this.profileForm.patchValue({
          nationality: Array.isArray(nat) ? nat : String(nat).split(',').map((s: string) => s.trim()).filter(Boolean)
        });
      }
      // If jobOrderId exists, filter job orders by client and set the value
      if (this.passedData['jobOrderId'] && this.passedData['profileForClient']) {
        this.onClientChange(this.passedData['profileForClient']);
        // Wait a bit for the filtered list to populate, then set the jobOrderId
        setTimeout(() => {
          this.profileForm.patchValue({ jobOrderId: this.passedData['jobOrderId'] });
        }, 100);
      }
    }
    if (this.passedData?.action === 'edit') {
      this.isEditMode = true;
      this.recordId = this.passedData.id;
      this.profileForm.patchValue(this.passedData);
      this.profileForm.get('resume')?.clearValidators();  // Optional: Resume not mandatory in edit
      this.profileForm.get('resume')?.updateValueAndValidity();
    } else if (this.passedData?.action === 'view') {
      this.profileForm.patchValue(this.passedData);
      this.profileForm.disable(); // Read-only mode
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.profileForm.patchValue({
        resume: file
      });
    }
  }

  onDownload(fileKey: string): void {
    this.commonService.downloadFile(fileKey);
  }

  loadCountries(): void {
    this.commonService.getCountries().subscribe((data) => {
      if (data.length > 0) {
        this.locations = data.sort((a: any, b: any) =>
          a.countryName.localeCompare(b.countryName)
        );
      }
    });
  }

  loadClients(): void {
    this.commonService.getClients().subscribe((data) => {
      if (data.length > 0) {
        this.clients = data.sort((a: any, b: any) =>
          a.clientName.localeCompare(b.clientName)
        );
        this.filteredClients = this.clients;
      }
    });
  }

  loadCurrency(): void {
    this.commonService.getCurrency().subscribe((data) => {
      if (data.length > 0) {
        this.currency = data.sort((a: any, b: any) =>
          a.currencyName.localeCompare(b.currencyName)
        );
      }
      this.currency = data;
    });
  }

  loadLanguage(): void {
    this.commonService.getLanguage().subscribe((data) => {
      if (data.length > 0) {
        this.language = data.sort((a: any, b: any) =>
          a.languageName.localeCompare(b.languageName)
        );
      }
      this.language = data;
    });
  }

  loadJobOrders(): void {
    this.jobOrderService.getAllJobOrders().subscribe({
      next: (data) => {
        this.jobOrders = data || [];
        // If a client is already selected, filter job orders
        const selectedClient = this.profileForm.get('profileForClient')?.value;
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
      this.profileForm.patchValue({ jobOrderId: '', profileForJobRole: '' });
    } else {
      this.filteredJobOrders = [];
      this.profileForm.patchValue({ jobOrderId: '', profileForJobRole: '' });
    }
  }

  onJobOrderChange(jobOrderId: string): void {
    if (jobOrderId) {
      // Find the selected job order and set profileForJobRole to job title for backward compatibility
      const selectedJobOrder = this.filteredJobOrders.find(job => job.id === jobOrderId);
      if (selectedJobOrder) {
        this.profileForm.patchValue({ profileForJobRole: selectedJobOrder.jobTitle });
      }
    } else {
      this.profileForm.patchValue({ profileForJobRole: '' });
    }
  }

  onClientSearch(term: string): void {
    this.clientSearchTerm = term || '';
    const search = this.clientSearchTerm.toLowerCase();
    this.filteredClients = this.clients.filter((c: any) =>
      c.clientName.toLowerCase().includes(search)
    );
  }

  onSubmit(status:string): void {
    
    if (this.profileForm.valid) {
      const profile = this.profileForm.value;
  
      const submissionData = {
        ...profile,       
      };
      if (Array.isArray(submissionData.jobLanguage)) {
        submissionData.jobLanguage = submissionData.jobLanguage.join(', ');
      }
      if (Array.isArray(submissionData.nationality)) {
        submissionData.nationality = submissionData.nationality.join(', ');
      }
      if (profile.availabilityDate) {
        submissionData.availabilityDate = new Date(profile.availabilityDate).toISOString();
      }else{
        delete submissionData['availabilityDate']
      }
      submissionData.status=status
      const formData = new FormData();
      Object.keys(submissionData).forEach((keyName) => {
        formData.append(keyName, submissionData[keyName]);
      });

  
      if (this.isEditMode && this.recordId) {
        formData.append('profileId', this.passedData['profileId']);
        formData.append('createdById',this.passedData['createdById'])
        this.commonService.updateFutureJobsProfile(this.recordId, formData).subscribe((resp: any) => {
          
          this.router.navigateByUrl('/app/future-jobs');
        });
      } else {
          if(this.profileForm.value.resume){
            formData.append('file', this.profileForm.value.resume, this.profileForm.value.resume.name);
          }
          formData.append('submittedBy', this.accountDetails.name);
          formData.append('createdById', this.createdById ? this.createdById : this.accountDetails.id);
        this.commonService.saveFutureJobsProfile(formData).subscribe((resp: any) => {
          
          this.router.navigateByUrl('/app/future-jobs');
        });
      }
    }
  }
  
  
  onCancel(): void {
    this.router.navigate(['/app/future-jobs'])
  }


}
