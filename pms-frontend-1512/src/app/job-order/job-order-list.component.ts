import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { JobOrderService } from './job-order.service';
import { CommonService } from '@shared/services/common.service';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@shared/base/base.component';

@Component({
  selector: 'app-job-order-list',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDatepickerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './job-order-list.component.html',
  styleUrls: ['./job-order-list.component.scss'],
})
export class JobOrderListComponent extends BaseComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'jobId',
    'clientName',
    'jobTitle',
    'workLocationCountry',
    'numberOfPositions',
    'numberOfSelections',
    'status',
    'jobStartDate',
    'jobEndDate',
    'jobAging',
    'jobOwner',
    'actions',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  jobOrders: any[] = [];
  filteredJobOrders: any[] = [];
  private snackBar = inject(MatSnackBar);
  dataSource = new MatTableDataSource<any>([]);
  
  searchForm: FormGroup;
  clients: any[] = [];
  employees: any[] = [];
  statusOptions = [
    { value: 'Open', display: 'Open' },
    { value: 'Closed', display: 'Closed' },
    { value: 'WIP', display: 'WIP' },
    { value: 'Cancelled', display: 'Cancelled' },
    { value: 'New', display: 'New' },
    { value: 'In progress', display: 'In progress' },
    { value: 'Hold', display: 'Hold' },
  ];

  constructor(
    private router: Router,
    private jobOrderService: JobOrderService,
    private commonService: CommonService,
    private fb: FormBuilder
  ) {
    super();
    this.searchForm = this.fb.group({
      jobId: [''],
      clientName: [''],
      jobTitle: [''],
      status: [''],
      jobStartDateFrom: [''],
      jobStartDateTo: [''],
      jobEndDateFrom: [''],
      jobEndDateTo: [''],
      jobOwner: [''],
      deliveryLead: [''],
    });
  }

  ngOnInit(): void {
    this.loadJobOrders();
    this.loadDropdownData();
  }

  loadDropdownData(): void {
    // Load clients
    this.commonService.getClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.clients = data || [];
        },
        error: (err) => {
          console.error('Error loading clients:', err);
        },
      });

    // Load employees (for job owner and delivery lead)
    this.commonService.getAllEmployee()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.employees = data || [];
        },
        error: (err) => {
          console.error('Error loading employees:', err);
        },
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadJobOrders(): void {
    this.jobOrderService.getAllJobOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.jobOrders = (data || []).map((order: any) => ({
            ...order,
            jobAging: this.calculateJobAging(order.jobStartDate),
          }));
          this.dataSource.data = this.jobOrders;
        },
        error: (err: any) => {
          console.error('Error loading job orders:', err);
          // If endpoint doesn't exist yet, show empty table
          this.jobOrders = [];
          this.dataSource.data = [];
        },
      });
  }

  calculateJobAging(jobStartDate: string | Date): number {
    if (!jobStartDate) return 0;
    const startDate = new Date(jobStartDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  createJobOrder(): void {
    this.router.navigate(['/app/job-order/create']);
  }

  viewJobOrder(jobOrder: any): void {
    const payload = {
      viewMode: true,
      editMode: false,
      id: jobOrder.id,
    };
    this.router.navigate(['/app/job-order/create'], {
      queryParams: { data: JSON.stringify(payload) },
    });
  }

  editJobOrder(jobOrder: any): void {
    const payload = {
      editMode: true,
      viewMode: false,
      id: jobOrder.id,
    };
    this.router.navigate(['/app/job-order/create'], {
      queryParams: { data: JSON.stringify(payload) },
    });
  }

  deleteJobOrder(jobOrder: any): void {
    if (confirm('Are you sure you want to delete this job order?')) {
      this.jobOrderService.deleteJobOrder(jobOrder.id).subscribe({
        next: () => {
          this.snackBar.open('Job order deleted successfully', 'Close', {
            duration: 3000,
          });
          this.loadJobOrders();
        },
        error: (err: any) => {
          console.error('Error deleting job order:', err);
          this.snackBar.open('Error deleting job order', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }

  searchRecords(): void {
    const formValue = this.searchForm.value;
    let filtered = [...this.jobOrders];

    // Filter by Job ID
    if (formValue.jobId) {
      filtered = filtered.filter((order) =>
        order.jobId?.toLowerCase().includes(formValue.jobId.toLowerCase())
      );
    }

    // Filter by Client Name
    if (formValue.clientName) {
      filtered = filtered.filter((order) =>
        order.clientName?.toLowerCase().includes(formValue.clientName.toLowerCase())
      );
    }

    // Filter by Job Title
    if (formValue.jobTitle) {
      filtered = filtered.filter((order) =>
        order.jobTitle?.toLowerCase().includes(formValue.jobTitle.toLowerCase())
      );
    }

    // Filter by Status
    if (formValue.status) {
      filtered = filtered.filter((order) => order.status === formValue.status);
    }

    // Filter by Job Start Date
    if (formValue.jobStartDateFrom) {
      const fromDate = new Date(formValue.jobStartDateFrom);
      filtered = filtered.filter((order) => {
        if (!order.jobStartDate) return false;
        const orderDate = new Date(order.jobStartDate);
        return orderDate >= fromDate;
      });
    }

    if (formValue.jobStartDateTo) {
      const toDate = new Date(formValue.jobStartDateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((order) => {
        if (!order.jobStartDate) return false;
        const orderDate = new Date(order.jobStartDate);
        return orderDate <= toDate;
      });
    }

    // Filter by Job End Date
    if (formValue.jobEndDateFrom) {
      const fromDate = new Date(formValue.jobEndDateFrom);
      filtered = filtered.filter((order) => {
        if (!order.jobEndDate) return false;
        const orderDate = new Date(order.jobEndDate);
        return orderDate >= fromDate;
      });
    }

    if (formValue.jobEndDateTo) {
      const toDate = new Date(formValue.jobEndDateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((order) => {
        if (!order.jobEndDate) return false;
        const orderDate = new Date(order.jobEndDate);
        return orderDate <= toDate;
      });
    }

    // Filter by Job Owner
    if (formValue.jobOwner) {
      filtered = filtered.filter((order) => order.jobOwner === formValue.jobOwner);
    }

    // Filter by Delivery Lead
    if (formValue.deliveryLead) {
      filtered = filtered.filter((order) => order.deliveryLead === formValue.deliveryLead);
    }

    this.filteredJobOrders = filtered;
    this.dataSource.data = filtered;
  }

  reset(): void {
    this.searchForm.reset();
    this.dataSource.data = this.jobOrders;
    this.filteredJobOrders = [];
  }
}

