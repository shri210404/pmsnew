import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FutureJobsFormComponent } from './future-jobs-form/future-jobs-form.component'
import { Profile } from './profile.model';
import { Router } from '@angular/router';
import { CommonService } from '@shared/services/common.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@shared/base/base.component';

@Component({
  selector: 'app-future-jobs',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatToolbarModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatOptionModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule
  ],
  templateUrl: './future-jobs.component.html',
  styleUrls: ['./future-jobs.component.scss']
})
export class FutureJobsComponent extends BaseComponent implements OnInit,AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = [
    'profileId',
    'name',
    'roleFor',
    'nativeLanguage',
    'jobLanguage',
    'dateUpdated',
    'nationality',
    'availabilityDate',
    'recruiter',
    'actions'  // for edit/view/download etc.
  ];
  
  dataSource = new MatTableDataSource<Profile>();
  
  submissionForm = new FormGroup({
    profileId: new FormControl(''),

    emailId: new FormControl(''),

    name:new FormControl(''),
  
    // Resume Submission
    // resumeSubmissionFrom: new FormControl(''),
    // resumeSubmissionTo: new FormControl(''),
  
    // Role Info
    currentJobRole: new FormControl(''),
    profileForClient: new FormControl(''),
  
    // Availability
    availabilityFrom: new FormControl(''),
    availabilityTo: new FormControl(''),
  
    // Relocate Info
    nationality: new FormControl(''),
    willingToRelocate: new FormControl(''),
    currentLocation: new FormControl(''),
  
    // Language Hiring
    nativeLanguage: new FormControl(''),
    jobLanguage: new FormControl(''),
  
    // Recruiter
    recruiter: new FormControl('')
  });
  locations: any;
  clients: any;
  currency: any;
  language: any;
  accountDetails: any;
  recruiters: any
  

  constructor(public dialog: MatDialog,private router:Router,private commonService:CommonService) {
    super();
  }

  ngOnInit(): void {
     const startOfWeek = moment().startOf('isoWeek').toDate();
     const endOfWeek = moment().endOf('isoWeek').toDate();
    // Load initial data or fetch from API
    this.accountDetails = localStorage.getItem('account-details');
    if (this.accountDetails) {
      this.accountDetails = JSON.parse(this.accountDetails).userdetails;
    }
    this.searchRecords(startOfWeek, endOfWeek);
    this.loadClients();
    this.loadCountries();
    this.loadCurrency();
    this.getRecruriterBasedOnRole()
    this.loadLanguage();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  getRecruriterBasedOnRole() {
    const payload = {
      username: this.accountDetails.username,
      roleName: this.accountDetails.role
    }
    this.commonService.getAllRecruriter(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any[]) => {
        if (data.length > 0) {

          this.recruiters = data.flat().sort((a: string, b: string) => a.localeCompare(b));;
        }
      });
  }

  openSubmitForm(event:Event): void {
    event.preventDefault(); 
    this.router.navigateByUrl('/app/future-jobs-form');
  }

  onRowClick(row: any,action:any,event:Event): void {
    row.action=action
    event.preventDefault(); 
    this.router.navigateByUrl('/app/future-jobs-form',{ state: { data: row } })
    //this.dataSource = this.dataSource.filter(profile => profile.id !== id);
  }

  viewResume(url: string): void {
    // Implement resume viewing logic
    window.open(url, '_blank');
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

  reset() {
    this.submissionForm.reset();
  }

  searchRecords(dateFromInit?: any, dateToInit?: any): void {
    const {
      profileId,
      // resumeSubmissionFrom,
      // resumeSubmissionTo,
      emailId,
      name,
      currentJobRole,
      profileForClient,
      availabilityFrom,
      availabilityTo,
      nationality,
      willingToRelocate,
      currentLocation,
      nativeLanguage,
      jobLanguage,
      recruiter,
    } = this.submissionForm.value;
  
    const payload = {
      profileId,
      currentJobRole,
      profileForClient,
      nationality,
      readyToRelocate: willingToRelocate,
      currentLocation,
      nativeLanguage,
      jobLanguage,
      recruiter,
      emailId,
      name,
      // Add 1 day for PROD logic
      // resumeSubmissionFrom: resumeSubmissionFrom
      //   ? new Date(
      //       new Date(resumeSubmissionFrom).setUTCDate(
      //         new Date(resumeSubmissionFrom).getUTCDate() + 1
      //       )
      //     ).setUTCHours(0, 0, 0, 0)
      //   : dateFromInit,
  
      // resumeSubmissionTo: resumeSubmissionTo
      //   ? new Date(
      //       new Date(resumeSubmissionTo).setUTCDate(
      //         new Date(resumeSubmissionTo).getUTCDate() + 1
      //       )
      //     ).setUTCHours(23, 59, 59, 999)
      //   : dateToInit,
  
      availabilityFrom: availabilityFrom
        ? new Date(
            new Date(availabilityFrom).setUTCHours(0, 0, 0, 0)
          ).toISOString()
        : null,
  
      availabilityTo: availabilityTo
        ? new Date(
            new Date(availabilityTo).setUTCHours(23, 59, 59, 999)
          ).toISOString()
        : null,
  
      id: this.accountDetails?.id,
      role: this.accountDetails?.role,
      username: this.accountDetails?.username,
    };
  
  
    this.commonService.searchFutureJobsProfile(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          const adjustedData = resp.sort(
            (a: any, b: any) => b.createdAt.localeCompare(a.createdAt)
          );
      
          // Update the MatTableDataSource instance
          this.dataSource.data = adjustedData;
    
        // Optional: reset to first page
        if (this.paginator) this.paginator.firstPage();
      },
      error: (err) => { /* handle error */ },
    });
    
  }
  
  
}