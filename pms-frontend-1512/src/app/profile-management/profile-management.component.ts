import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { ProposalManagementService } from '../proposal-management/services/proposal-management.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonService } from '@shared/services/common.service';
import moment from 'moment';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import * as momentTime from 'moment-timezone';
import { MatIconModule } from '@angular/material/icon';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@shared/base/base.component';


@Component({
  selector: 'app-profile-management',
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
    MatPaginatorModule,
    MatIconModule
  ],
  templateUrl: './profile-management.component.html',
  styleUrls: ['./profile-management.component.scss'],
})
export class ProfileManagementComponent extends BaseComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'profileId',
    'submissionDate',
    'name',
    'role',
    'client',
    'location',
    'salary',
    'status',
    //'email',
    'submittedBy',
    'actions',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  loadProposal: any[] = [];
  private snackBar = inject(MatSnackBar);
  dataSource = new MatTableDataSource<any>([]);
  accountDetails: any;
  payloadFilter: any;
  isBusinessHead: any;
  submissionForm = new FormGroup({
    profileId: new FormControl(''),
    client: new FormControl(''),
    location: new FormControl(''),
    recruiter: new FormControl(''),
    dateFrom: new FormControl(''),
    dateTo: new FormControl(''),
    candidateName: new FormControl(''),
    status: new FormControl(''),
    email: new FormControl(''),
    selectionDateFrom: new FormControl(''),
    selectionDateTo: new FormControl(''),
    joiningDateFrom: new FormControl(''),
    joiningDateTo: new FormControl(''),
  });
  clients: any;
  locations: any;
  recruiters: any;
  status = [
    { value: 'SUBMITTED', display: 'SUBMITTED' },
    { value: 'PROPOSED', display: 'PROPOSED' },
    { value: 'ROLE_HOLD', display: 'ROLE-HOLD' },
    { value: 'ROLE_CLOSED', display: 'ROLE-CLOSED' },
    { value: 'REJECTED_INTERNAL', display: 'REJECTED-INTERNAL' },
    { value: 'REJECTED_CLIENT', display: 'REJECTED-CLIENT' },
    { value: 'SELECTED', display: 'SELECTED' },
    { value: 'JOINED', display: 'JOINED' },
    { value: 'DROPPED_INTERNAL', display: 'DROPPED-CANDIDATE' },
    { value: 'DROPPED_CLIENT', display: 'DROPPED-CLIENT' },
    { value: 'PENDING_SUBMISSION', display: 'PENDING-SUBMISSION' },
  ];
  
  records: any;
  isRecruiter: any;
  allowedRoles: any;
  searchClicked:boolean=false;
  constructor(
    private dialog: MatDialog,
    private router: Router,
    private proposalService: ProposalManagementService,
    private commonService: CommonService
  ) {
    super();
  }

  ngOnInit(): void {
    const startOfWeek = moment().startOf('isoWeek').toDate();
    const endOfWeek = moment().endOf('isoWeek').toDate();
    this.accountDetails = localStorage.getItem('account-details');
    if (this.accountDetails) {
      this.accountDetails = JSON.parse(this.accountDetails).userdetails;
    }
    this.isRecruiter = this.accountDetails.role === 'Recruiter';
    

    this.allowedRoles = ['Business Head', 'Admin', 'Finance Manager'];
    this.isBusinessHead = this.allowedRoles.includes(this.accountDetails.role);

    this.payloadFilter = {
      role: this.accountDetails.role,
      reportsTo: this.accountDetails.reportsTo,
      id: this.accountDetails.id,
    };
    if (this.accountDetails.role == 'Client Manager') {
      this.getClientName();
    } else {
      this.getClient();
    }

    this.getCountry();
    this.getRecruriterBasedOnRole();
    this.searchRecords(startOfWeek, endOfWeek);
  }

  ngAfterViewInit(): void {
    // Assign paginator after view initialization
    this.dataSource.paginator = this.paginator;
  }

  reset() {
    this.submissionForm.reset();
  }

  searchRecords(dateFromInit?: any, dateToInit?: any) {
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
      joiningDateTo,
    } = this.submissionForm.value;
    // Create the payload object with form values
    const payload = {
      client,
      location,
      recruiter,
      candidateName,
      status,
      email,
      profileId,
      
      //for prod adding 1 days to dateFrom and dateTo
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

      id: this.accountDetails?.id,
      role: this.accountDetails?.role,
      username: this.accountDetails?.username,
    };

    this.commonService.searchRecords(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          
          const adjustedData = response.map((record: any) => {
            return {
              ...record,
              createdAt: momentTime.utc(record.createdAt)
                                .tz('Asia/Kuala_Lumpur')
                                .format('YYYY-MM-DD HH:mm:ss')
            };
          });
          
          this.dataSource.data = adjustedData.sort(
            (a: any, b: any) => b.createdAt.localeCompare(a.createdAt) // just swap a & b
          );
        },
        (error) => {
          console.error('Error fetching records:', error);
        }
      );
  }

  getClientName() {
    this.commonService.getUserClientByUserId(this.accountDetails.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: any) => {
          if (Array.isArray(data) && data.length > 0) {
            this.clients = data.map((item: any) => item.client.clientName);
          } else {
            this.clients = [];
          }
        },
        (error) => {
          
          this.clients = [];
        }
      );
  }

  getClient() {
    this.commonService.getClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: any) => {
          if (Array.isArray(data) && data.length > 0) {
            this.clients = data.map((country: any) => country.clientName)
            .sort((a: string, b: string) => a.localeCompare(b));
          } else {
            this.clients = [];
          }
        },
        (error) => {
          
          this.clients = [];
        }
      );
  }

  getCountry() {
    this.commonService.getCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: any) => {
          if (Array.isArray(data) && data.length > 0) {
            // Map and sort
            this.locations = data
              .map((country: any) => country.countryName)
              .sort((a: string, b: string) => a.localeCompare(b));
          } else {
            this.locations = [];
          }
        },
        (error) => {
          console.error('Error fetching countries:', error);
          this.locations = [];
        }
      );
  }

  getRecruriterBasedOnRole() {
    const payload = {
      username: this.accountDetails.username,
      roleName: this.accountDetails.role,
    };
    this.commonService.getAllRecruriter(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: string[]) => {
        if (data.length > 0) {
          this.recruiters = data.flat() .sort((a: string, b: string) => a.localeCompare(b));;
        }
      });
  }

  // editProfile(profile: any): void {
  //   const payload = {
  //     editMode: true,
  //     viewMode: false,
  //     id: profile.id,
  //   };
  //   this.router.navigate(['app/add-new-profile'], {
  //     queryParams: { data: JSON.stringify(payload) },
  //   });
  // }

  // viewProfile(profile: any): void {
  //   profile['viewMode'] = true;
  //   profile['editMode'] = false;
  //   this.router.navigate(['app/add-new-profile'], {
  //     queryParams: { data: JSON.stringify(profile) },
  //   });
  // }

  editProfile(profile: any, newTab: boolean = false): void {
  const payload = {
    editMode: true,
    viewMode: false,
    id: profile.id,
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

viewProfile(profile: any, newTab: boolean = false): void {
  profile['viewMode'] = true;
  profile['editMode'] = false;

  const url = this.router.serializeUrl(
    this.router.createUrlTree(['app/add-new-profile'], {
      queryParams: { data: JSON.stringify(profile) },
    })
  );

  if (newTab) {
    window.open(url, '_blank'); // ✅ Open in new tab
  } else {
    this.router.navigateByUrl(url); // ✅ Same tab
  }
}


  addNewProfile(event:Event): void {
    event.preventDefault(); // Prevent form submission
    this.router.navigateByUrl('/app/add-new-profile');
  }
}
