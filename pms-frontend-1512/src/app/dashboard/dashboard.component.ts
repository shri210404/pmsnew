import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { lastValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TilesComponent } from '@shared/components/tiles/tiles.component';
import { CommonService } from '@shared/services/common.service';
import { ProposalManagementService } from '../proposal-management/services/proposal-management.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { BaseComponent } from '@shared/base/base.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    TilesComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    RouterLink,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    FormsModule,
    MatDatepickerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent extends BaseComponent implements OnInit {
  @ViewChild('nameInput', { static: true }) nameInput!: ElementRef;
  @ViewChild('clientInput', { static: true }) clientInput!: ElementRef;
  @ViewChild('startDateInput', { static: true }) startDateInput!: ElementRef;
  @ViewChild('endDateInput', { static: true }) endDateInput!: ElementRef;

  public proposal = new MatTableDataSource();
  public displayedColumns = [
    'createdAt',
    'candidateName',
    'roleApplied',
    'location',
    'clientName',
    'createdBy',
    'submittedTo',
    'submittedStatus',
    'approvedSalary',
    'joiningDate',
    'action',
  ];

  statusOptions: string[] = ['PROPOSED', 'REJECTED', 'IN_PROCESS', 'SELECTED'];

  accountDetails: any;
  payloadFilter: any;
  clients: any;
  totalProposed: any;
  totalSubmitted: any;
  totalSelected: any;
  totalSubmission: any;
  totalJoined: any;
  totalDroppedClient:any;
  totalDroppedInternal:any;
  totalRejectedClient:any;
  totalRejectedInternal:any
  isDashboard:boolean=true
  todayDate: Date = new Date();
  constructor(
    private commonService: CommonService,
    private proposalService: ProposalManagementService
  ) {
    super();
  }

  ngOnInit(): void {
    
    const startDate = new Date();
    startDate.setDate(1); // Set to first day of the month
    startDate.setHours(0, 0, 0, 0); // Set time to start of the day

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1, 0); // Set to last day of the month
    endDate.setHours(23, 59, 59, 999);
    this.accountDetails = localStorage.getItem('account-details');
    if (this.accountDetails) {
      this.accountDetails = JSON.parse(this.accountDetails).userdetails;
    }

    this.payloadFilter = {
      role: this.accountDetails.role,
      reportsTo: this.accountDetails.reportsTo,
      id: this.accountDetails.id,
    };
    this.getAllProposal(startDate, endDate);
  }

  public loadClients(): void {
    this.commonService.getClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.clients = data.length;
      });
  }

  public applyFilter(): void {
    const nameValue = this.nameInput.nativeElement.value.toLowerCase().trim();
    const clientValue = this.clientInput.nativeElement.value
      .toLowerCase()
      .trim();
    const startDate = new Date(this.startDateInput.nativeElement.value);
    const endDate = new Date(this.endDateInput.nativeElement.value);

    this.proposal.filterPredicate = (data: any) => {
      const isNameMatch = data.candidateName.toLowerCase().includes(nameValue);
      const isClientMatch = data.clientName.toLowerCase().includes(clientValue);
      const createdAt = new Date(data.createdAt);

      // Check if the `createdAt` date is within the start and end dates
      const isDateInRange =
        (!isNaN(startDate.getTime()) ? createdAt >= startDate : true) &&
        (!isNaN(endDate.getTime()) ? createdAt <= endDate : true);

      return isNameMatch && isClientMatch && isDateInRange;
    };

    this.proposal.filter = Math.random().toString(); // Trigger filtering
  }

  public resetFilter(): void {
    // Clear the input fields
    this.nameInput.nativeElement.value = '';
    this.clientInput.nativeElement.value = '';
    this.startDateInput.nativeElement.value = '';
    this.endDateInput.nativeElement.value = '';

    // Clear the proposal filter
    this.proposal.filter = '';

    // Reload all proposals to show unfiltered data
    this.getAllProposal();
  }

  public getAllProposal(startDate?: any, endDate?: any): void {
    this.proposalService.getProposalsByFilter(
        this.payloadFilter.role,
        this.payloadFilter.reportsTo,
        this.payloadFilter.id,
        startDate,
        endDate,
        this.isDashboard
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((resp:any)=>{
        const count = resp[0];
        this.totalSubmission =count.total;
        this.totalProposed =count.totalProposed;
        this.totalSelected =count.totalSelection;
        this.totalJoined =count.totalJoined;
        this.totalSubmitted = count.totalSubmission;
        this.totalDroppedClient = count.totalDroppedClient;
        this.totalDroppedInternal= count.totalDroppedInternal;
        this.totalRejectedClient= count.totalRejectedClient;
        this.totalRejectedInternal=count.totalRejectedInternal
      });
  }

  editRow(element: any) {
    element.isEditing = !element.isEditing;
  }

  deleteRow(element: any) {
    // Handle row deletion logic here
  }
}
