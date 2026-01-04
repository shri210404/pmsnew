import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonService } from '@shared/services/common.service';
import { ProposalManagementService } from 'src/app/proposal-management/services/proposal-management.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-user-client',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule
  ],
  templateUrl: './user-client.component.html',
  styleUrls: ['./user-client.component.scss'],
})
export class UserClientComponent implements OnInit {
  userClientForm: FormGroup;
  users: any[] = [];
  clients: any[] = [];
  userClient: any[] = [];
  savedList: { user: string; client: string }[] = [];
  displayedColumns: string[] = ['user', 'client', 'actions'];
  selectedIndex: number | null = null;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);

  constructor(
    private fb: FormBuilder,
    private proposalService: ProposalManagementService,
    private commonService: CommonService
  ) {
    this.userClientForm = this.fb.group({
      users: ['', Validators.required],
      clients: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getAllClient();
    this.getUserRoleList();
    this.getUserClient();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getAllClient(): void {
    this.commonService.getClients().subscribe((data) => {
      this.clients = data.sort(
        (a: any, b: any) => a.clientName.localeCompare(b.clientName)
      );
    });
  }

  getUserRoleList(): void {
    this.commonService.getUserClientRoleList().subscribe((data) => {
      this.users = data.users.sort(
        (a: any, b: any) => a.username.localeCompare(b.username)
      );
    });
  }

  getUserClient(): void {
    this.commonService.getUserClient().subscribe((data) => {
      this.userClient = data.sort((a: any, b: any) => {
        const nameA = a.user.username.toLowerCase();
        const nameB = b.user.username.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      this.dataSource.data = this.userClient;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  saveUserClient(): void {
    const { users, clients } = this.userClientForm.value;
  
    if (!this.userClientForm.valid) {
      return;
    }
  
    if (this.selectedIndex !== null) {
      const previousEntry = this.userClient[this.selectedIndex];
      const previousUserId = previousEntry.user.id;
      const previousClientId = previousEntry.client.id;
  
      const payload = { userId: users, clientId: clients };
  
      this.commonService.updateUserClient(previousUserId, previousClientId, payload).subscribe(
        (response: any) => {
          this.getUserClient();
          this.selectedIndex = null;
          this.userClientForm.reset();
        },
        (error) => console.error('Update failed:', error)
      );
    } else {
      const payload = { userId: users, clientId: clients };
  
      this.commonService.saveUserClient(payload).subscribe((response: any) => {
        this.resetForm();
        this.getUserClient();
      });
    }
  }

  editUserClient(index: number): void {
    // Calculate the actual index considering pagination
    const pageIndex = this.paginator.pageIndex;
    const pageSize = this.paginator.pageSize;
    const actualIndex = pageIndex * pageSize + index;
    
    this.selectedIndex = actualIndex;
    const entry = this.userClient[actualIndex];
  
    if (entry) {
      this.userClientForm.patchValue({
        users: entry.user.id,
        clients: entry.client.id,
      });
    }
  }

  resetForm() {
    this.userClientForm.reset();
    this.userClientForm.markAsPristine();
    this.userClientForm.markAsUntouched();
    Object.keys(this.userClientForm.controls).forEach((key) => {
      const control = this.userClientForm.get(key);
      if (control) {
        control.setErrors(null);
      }
    });
    this.selectedIndex = null;
  }
}