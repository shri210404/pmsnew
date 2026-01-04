import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { CommonService } from '@shared/services/common.service';
import moment from 'moment';
import { MatPaginator, MatPaginatorModule, } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';




interface Record {
  name: string;
  roleApplied: string;
  nationality: string;
  email: string;
  contact: string;
  noticePeriod: number;
  passportValidity: string;
  currentSalary: number;
  expectedSalary: number;
  selectionDate: string;
  joiningDate: string;
  salary: number;
  currency: string;
  status: string;
  remarks: string;
}

@Component({
  selector: 'app-submission-management',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule
  ],
  templateUrl: './submission-management.component.html',
  styleUrls: ['./submission-management.component.scss'],
})
export class SubmissionManagementComponent implements OnInit {
  // Form fields
  submissionForm = new FormGroup({
    client: new FormControl(''),
    location: new FormControl(''),
    recruiter: new FormControl(''),
    dateFrom: new FormControl(''),
    dateTo: new FormControl(''),
    candidateName: new FormControl(''),
    status: new FormControl(''),
    email: new FormControl(''),
    profileId: new FormControl(''),
    selectionDateFrom: new FormControl(''),
    selectionDateTo: new FormControl(''),
    joiningDateFrom: new FormControl(''),
    joiningDateTo: new FormControl('')

  });
  accountDetails: any;
  searchClicked:boolean=false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);
  constructor(private commonService: CommonService, private router: Router) { }

  ngOnInit(): void {
    const startOfWeek =  moment().startOf('isoWeek').toDate();
    const endOfWeek =moment().endOf('isoWeek').toDate();
    this.getCountry();

    this.accountDetails = localStorage.getItem('account-details');
    if (this.accountDetails) {
      this.accountDetails = JSON.parse(this.accountDetails).userdetails;
    }

    if(this.accountDetails.role =='Client Manager'){
      this.getClientName()
    }else{
      this.getClient();
    }
    this.getRecruriterBasedOnRole();
    this.searchRecords(startOfWeek,endOfWeek);
  }
  ngAfterViewInit(): void {
    // Assign paginator after view initialization
    this.dataSource.paginator = this.paginator;
  }

  // Dropdown data
  clients: any = [];
  locations: any = [];
  recruiters: string[] = [];
  status = [
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
  allowedRoles = ['Business Head', 'Admin', 'Finance Manager', 'Client Manager'];

  // Filtered records based on search
  records: Record[] = [];

  // Columns displayed in the table
  displayedColumns: string[] = [
    'profileId',
    'submissionDate',
    'name',
    'roleApplied',
    'client',
    'location',
    'salary',
    'status',
    'submittedBy',
    'actions',
  ];

  reset() {
    this.submissionForm.reset();
  }
  // Search function to filter records
  searchRecords(dateFromInit?:any,dateToInit?:any) {
    const {
      client,
      location,
      recruiter,
       dateFrom,
      dateTo,
      candidateName,
      status,
      email,
      profileId,
      selectionDateFrom,
      selectionDateTo,
      joiningDateFrom,
      joiningDateTo
    } = this.submissionForm.value;
    // Create the payload object with form values
    const payload = {
      client,
      location,
      recruiter,
      candidateName,
      // dateFrom: dateFrom ? new Date(dateFrom) : '', // Use startOfWeek if dateFrom is not provided
      // dateTo: dateTo ? new Date(dateTo) : '',
      // dateFrom:dateFrom?dateFrom:dateFromInit,
      // dateTo:dateFrom?dateTo:dateToInit,
      // joiningDateFrom,
      // joiningDateTo,
      // selectionDateFrom,
      // selectionDateTo,
      dateFrom: dateFrom
      ? new Date(new Date(dateFrom).setUTCDate(new Date(dateFrom).getUTCDate() + 1))
          .setUTCHours(0, 0, 0, 0) // Start of next day in UTC
      : dateFromInit,
    
    dateTo: dateTo
      ? new Date(new Date(dateTo).setUTCDate(new Date(dateTo).getUTCDate() + 1))
          .setUTCHours(23, 59, 59, 999) // End of next day in UTC
      : dateToInit,
    selectionDateFrom: selectionDateFrom
      ? new Date(
          new Date(selectionDateFrom).setUTCHours(0, 0, 0, 0)
        ).toISOString()
      : null,

    selectionDateTo: selectionDateTo
      ? new Date(
          new Date(selectionDateTo).setUTCHours(23, 59, 59, 999)
        ).toISOString()
      : null,

    joiningDateFrom: joiningDateFrom
      ? new Date(
          new Date(joiningDateFrom).setUTCHours(0, 0, 0, 0)
        ).toISOString()
      : null,

    joiningDateTo: joiningDateTo
      ? new Date(
          new Date(joiningDateTo).setUTCHours(23, 59, 59, 999)
        ).toISOString()
      : null,

      status,
      email,
      profileId,
      id: this.accountDetails?.id,
      role: this.accountDetails?.role,
      username: this.accountDetails?.username,
    };

    // Call the service with the payload
    this.commonService.searchRecords(payload).subscribe({
      next: (data) => {
        this.dataSource.data = data.sort(
          (a: any, b: any) => b.createdAt.localeCompare(a.createdAt) // just swap a & b
        );;
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
      },
    }
    );
  }

  getClientName() {
    this.commonService.getUserClientByUserId(this.accountDetails.id).subscribe(
      (data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          this.clients = data.map((item: any) => item.client.clientName)
          .sort((a: string, b: string) => a.localeCompare(b));
        } else {
          this.clients = [];
        }
      },
      (error) => {
        console.error('Error fetching clients:', error);
        this.clients = [];
      }
    );
  }

  getClient() {
    this.commonService.getClients().subscribe(
      (data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          this.clients = data.map((country: any) => country.clientName)
          .sort((a: string, b: string) => a.localeCompare(b));
        } else {
          this.clients = []; // Fallback if data is not an array or empty
        }
      },
      (error) => {
        console.error('Error fetching countries:', error);
        this.locations = []; // Fallback in case of an error
      }
    );
  }

  getCountry() {
    this.commonService.getCountries().subscribe(
      (data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          this.locations = data.map((country: any) => country.countryName)
          .sort((a: string, b: string) => a.localeCompare(b));
        } else {
          this.locations = []; // Fallback if data is not an array or empty
        }
      },
      (error) => {
        console.error('Error fetching countries:', error);
        this.locations = []; // Fallback in case of an error
      }
    );
  }

  getRecruriterBasedOnRole() {
    const payload = {
      username: this.accountDetails.username,
      roleName: this.accountDetails.role
    }
    this.commonService.getAllRecruriter(payload).subscribe((data: any[]) => {
      if (data.length > 0) {

        this.recruiters = data.flat().sort((a: string, b: string) => a.localeCompare(b));;
      }
    });
  }


  editProfile(profile: any,newTab: boolean = false): void {
    const payload = {
      editMode: true,
      viewMode: false,
      id: profile.id,
      isSubmission: true,
    };
  
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['app/add-new-profile'], {
        queryParams: { data: JSON.stringify(payload) },
      })
    );
  
    if (newTab) {
      window.open(url, '_blank'); // ✅ Open in new tab
    } else {
      this.router.navigateByUrl(url); // ✅ Same tab
    }
  }
  
  viewProfile(profile: any,newTab: boolean = false): void {
    const payload = {
      editMode: false,
      viewMode: true,
      id: profile.id,
      isSubmission: true,
    };
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['app/add-new-profile'], {
        queryParams: { data: JSON.stringify(payload) },
      })
    );
    if (newTab) {
      window.open(url, '_blank'); // ✅ Open in new tab
    } else {
      this.router.navigateByUrl(url); // ✅ Same tab
    }
  }
}
