import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportsService } from './reports.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DatePipe } from '@angular/common';
import { CommonService } from '@shared/services/common.service';
import { ProposalManagementService } from '../proposal-management/services/proposal-management.service';
import * as XLSX from 'xlsx'; // Import XLSX for Excel export
import moment from 'moment';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-my-reports',
  standalone: true,
  templateUrl: './my-reports.component.html',
  styleUrls: ['./my-reports.component.scss'],
  imports: [
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  providers: [DatePipe], // Add DatePipe here to use it in the component
})
export class MyReportsComponent implements OnInit {
  myReportsForm: FormGroup;
  displayedColumns: string[] = [
    'profileId',
    'submissionDate',
    'name',
    'role',
    'client',
    'location',
    'salary',
    'status',
    'submittedBy',
  ];
  role: string = 'non-recruiter'; // Set dynamically as per user role logic
  recruiters: any;
  locations: any;
  clients: any;
  reportsToList: any;
  accountDetails: any;
  isSendingEmail: boolean = false;
  selectedOrder: string[] = [];
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
  allowedRoles = [
    'Business Head',
    'Admin',
    'Finance Manager',
    'Client Manager',
  ];
  isRecruiter: any;
  isLoading = false;

  // Define paginator here
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<any>([]);

  constructor(
    private fb: FormBuilder,
    private myReportsService: ReportsService,
    private snackBar: MatSnackBar,
    private commonService: CommonService,
    private proposalService: ProposalManagementService,
    private datePipe: DatePipe // Inject DatePipe
  ) {
    this.myReportsForm = this.fb.group({
      dateFrom: [null],
      dateTo: [null],
      client: [''],
      location: [''],
      recruiter: [''],
      email: [''],
      profileId: [''],
      candidateName: [''],
      status: [''],
      emailSend: [''], // Add this line
      selectionDateFrom: [''],
      selectionDateTo: [''],
      joiningDateFrom: [''],
      joiningDateTo: [''],
    });

    this.accountDetails = localStorage.getItem('account-details');
    if (this.accountDetails) {
      this.accountDetails = JSON.parse(this.accountDetails).userdetails;
    }
  }

  ngOnInit(): void {
    const startOfWeek = moment().startOf('isoWeek').toDate();
    const endOfWeek = moment().endOf('isoWeek').toDate();
    this.isRecruiter = this.accountDetails.role === 'Recruiter' ? true : false;

    this.getRecruiter();
    this.getCountry();
    this.getUserRoleList();
    this.onSubmit(startOfWeek, endOfWeek);

    if (this.accountDetails.role == 'Client Manager') {
      this.getClientName();
    } else {
      this.getClient();
    }
  }

  getUserRoleList(): void {
    this.proposalService.getUserList().subscribe((data) => {
      this.reportsToList = data.sort(
        (a: any, b: any) => a.username.localeCompare(b.username) // just swap a & b
      );
    });
  }

  getClientName() {
    this.commonService.getUserClientByUserId(this.accountDetails.id).subscribe(
      (data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          this.clients = data
            .map((item: any) => item.client.clientName)
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

  onSubmit(dateFromInit?: any, dateToInit?: any): void {
    const formData = this.myReportsForm.value;

    // Format the date fields
    // Create the payload with formatted dates (excluding mailId)
    const { mailId, ...searchPayload } = formData; // Destructure to remove mailId from the payload

    const payload = {
      ...searchPayload,
      dateFrom: formData.dateFrom
        ? new Date(
            new Date(formData.dateFrom).setUTCDate(
              new Date(formData.dateFrom).getUTCDate() + 1
            )
          ).setUTCHours(0, 0, 0, 0) // Start of next day in UTC
        : dateFromInit,

      dateTo: formData.dateTo
        ? new Date(
            new Date(formData.dateTo).setUTCDate(
              new Date(formData.dateTo).getUTCDate() + 1
            )
          ).setUTCHours(23, 59, 59, 999) // End of next day in UTC
        : dateToInit,
      selectionDateFrom: formData.selectionDateFrom
        ? new Date(
            new Date(formData.selectionDateFrom).setUTCHours(0, 0, 0, 0)
          ).toISOString()
        : null,

      selectionDateTo: formData.selectionDateTo
        ? new Date(
            new Date(formData.selectionDateTo).setUTCHours(23, 59, 59, 999)
          ).toISOString()
        : null,

      joiningDateFrom: formData.joiningDateFrom
        ? new Date(
            new Date(formData.joiningDateFrom).setUTCHours(0, 0, 0, 0)
          ).toISOString()
        : null,

      joiningDateTo: formData.joiningDateTo
        ? new Date(
            new Date(formData.joiningDateTo).setUTCHours(23, 59, 59, 999)
          ).toISOString()
        : null,

      id: this.accountDetails?.id,
      role: this.accountDetails?.role,
      username: this.accountDetails?.username,
    };

    // Call the service to fetch data
    this.commonService.searchRecords(payload).subscribe({
      next: (data) => {
        this.dataSource.data = data.sort(
          (a: any, b: any) => b.createdAt.localeCompare(a.createdAt) // just swap a & b
        ); // Update the table data
        if (this.paginator) {
          this.dataSource.paginator = this.paginator; // Set paginator after fetching data
        }
      },
      error: () => {
        this.snackBar.open('Failed to load data', 'Close', { duration: 2000 });
      },
    });
  }

  formatCreatedAtDates(data: any[]): any[] {
    return data.map((item) => {
      // Create a copy of the object to avoid modifying the original
      const formattedItem = { ...item };

      // Check if createdAt exists and is a valid date
      if (formattedItem.createdAt) {
        const date = new Date(formattedItem.createdAt);

        // Only proceed if the date is valid
        if (!isNaN(date.getTime())) {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
          const year = date.getFullYear();

          formattedItem.createdAt = `${day}-${month}-${year}`;
        }
      }
      return formattedItem;
    });
  }

  sendEmailToSelectedMail(): void {
    if (this.isSendingEmail) return; // Prevent multiple clicks

    this.isSendingEmail = true; // Show spinner

    const mailId = this.selectedOrder;
    let toMail = '';
    let ccMail: string[] = [];

    if (mailId && mailId.length > 0) {
      toMail = mailId[0];

      if (mailId.length > 1) {
        ccMail = mailId.slice(1);
      }
    }

    const formatDate = (date: Date): string => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const payload = {
      toMail: toMail,
      messageBody: this.formatCreatedAtDates(this.dataSource.data),
      from: this.accountDetails.name,
      subject: 'My Submisson Reports',
      cc: ccMail,
    };
    this.myReportsService.sendEmail(payload).subscribe({
      next: () => {
        this.snackBar.open('Report sent to email successfully!', 'Close', {
          duration: 2000,
        });
        this.isSendingEmail = false; // Hide spinner
      },
      error: () => {
        this.snackBar.open('Failed to send the email', 'Close', {
          duration: 2000,
        });
        this.isSendingEmail = false; // Hide spinner
      },
    });
  }

  toggleSelection(report: any) {
    const username = report.username;
    const index = this.selectedOrder.indexOf(username);

    if (index === -1) {
      // Add to selection
      this.selectedOrder.push(username);
    } else {
      // Remove from selection
      this.selectedOrder.splice(index, 1);
    }

    // Update form control value
    //this.myReportsForm.get('emailSend').setValue([...this.selectedOrder]);
  }

  reset() {
    this.myReportsForm.reset();
  }

  /**
   * Export the data to Excel
   */
  exportToExcel(): void {
    if (!this.accountDetails || !this.accountDetails.role) {
      console.error('Role information is missing.');
      return;
    }

    // Get the role from account details
    const role = this.accountDetails.role;

    // Prepare the data to export based on the role
    const exportData = this.dataSource.data.map((item: any) => {
      // For roles like Admin, Business Head, Finance Manager, Client Manager
      if (
        [
          'Admin',
          'Business Head',
          'Finance Manager',
          'Client Manager',
          'HR Manager'
        ].includes(role)
      ) {
        return {
          Name: item.candidateName,
          Client: item.clientName,
          Location: item.location,
          Role: item.roleApplied,
          SubmissionDate: this.datePipe.transform(item.createdAt, 'dd-MM-yyyy'),
          ProposalDate: this.datePipe.transform(
            item.proposalDate,
            'dd-MM-yyyy'
          ),
          SelectionDate: this.datePipe.transform(
            item.selectionDate,
            'dd-MM-yyyy'
          ),
          JoiningDate: this.datePipe.transform(item.joiningDate, 'dd-MM-yyyy'),
          DropDate: this.datePipe.transform(
            item.rejection_dropped_Date,
            'dd-MM-yyyy'
          ),
          Status: item.submittedStatus,
          Salary: item.currentSalary,
          SalaryCurrency: item.salaryCurrency,
          SubmittedBy: item.createdByName,
          BillingAmount: item.billingAmount,
          BillingCurrency: item.billingCurrency,
          InvoiceAmount: item.invoiceNo,
          InvoiceDate: this.datePipe.transform(item.invoiceDate, 'dd-MM-yyyy'),
        };
      }

      // For roles like Delivery Manager, Recruiter
      if (['Delivery Manager', 'Recruiter'].includes(role)) {
        return {
          Name: item.candidateName,
          Client: item.clientName,
          Location: item.location,
          Role: item.roleApplied,
          SubmissionDate: this.datePipe.transform(item.createdAt, 'dd-MM-yyyy'),
          ProposalDate: this.datePipe.transform(
            item.proposalDate,
            'dd-MM-yyyy'
          ),
          SelectionDate: this.datePipe.transform(
            item.selectionDate,
            'dd-MM-yyyy'
          ),
          JoiningDate: this.datePipe.transform(item.joiningDate, 'dd-MM-yyyy'),
          DropDate: this.datePipe.transform(
            item.rejection_dropped_Date,
            'dd-MM-yyyy'
          ),
          Status: item.submittedStatus,
          Salary: item.currentSalary,
          SalaryCurrency: item.salaryCurrency,
          SubmittedBy: item.createdByName,
        };
      }

      // Default case if no role matches
      return {};
    });

    // Filter out any undefined or empty entries
    const filteredData = exportData.filter(
      (item: any) => Object.keys(item).length > 0
    );

    // Create a worksheet from the filtered data
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);

    // Create a workbook and add the worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reports');

    // Export the workbook to a file
    XLSX.writeFile(wb, 'my_reports.xlsx');
  }

  getRecruiter(): void {
    const payload = {
      username: this.accountDetails.username,
      roleName: this.accountDetails.role,
    };
    this.commonService.getAllRecruriter(payload).subscribe((data: any[]) => {
      if (data.length > 0) {
        this.recruiters = data
          .flat()
          .sort((a: string, b: string) => a.localeCompare(b));
      }
    });
  }

  getCountry(): void {
    this.commonService.getCountries().subscribe(
      (data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          this.locations = data
            .map((country: any) => country.countryName)
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

  getClient(): void {
    this.commonService.getClients().subscribe(
      (data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          this.clients = data
            .map((client: any) => client.clientName)
            .sort((a: string, b: string) => a.localeCompare(b));
        } else {
          this.clients = []; // Fallback if data is not an array or empty
        }
      },
      (error) => {
        console.error('Error fetching clients:', error);
        this.clients = []; // Fallback in case of an error
      }
    );
  }
}
