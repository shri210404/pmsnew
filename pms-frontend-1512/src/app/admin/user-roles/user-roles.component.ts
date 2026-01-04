import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonService } from '@shared/services/common.service';
import { ProposalManagementService } from 'src/app/proposal-management/services/proposal-management.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-user-roles',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTableModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    MatPaginatorModule
  ],
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.scss']
})
export class UserRolesComponent implements OnInit,AfterViewInit {
  userRoleForm: FormGroup;
  roles: any[] = [];       
  reportsToList: any[] = []; 
  displayedColumns: string[] = ['username', 'roleId', 'reportsTo', 'actions'];
  editingUserRole: any | null = null;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>();

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private snackBar: MatSnackBar,
    private proposalService:ProposalManagementService
  ) {
    this.userRoleForm = this.fb.group({
      username: ['', Validators.required],
      roleId: ['', Validators.required],
      reportsTo: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getUserRoleList();
    this.fetchRoles();
    this.fetchUserRoleDataList();
  }

  ngAfterViewInit(): void {
    // Connect the paginator to the MatTableDataSource
    this.dataSource.paginator = this.paginator;
  }

  getUserRoleList(): void {
    this.proposalService.getUserList().subscribe(data => {
      this.reportsToList = data.sort(
        (a: any, b: any) => a.username.localeCompare(b.username) // just swap a & b
      );;
      
    });
  }

  fetchRoles() {
    this.commonService.getAllRoles().subscribe((roles) => {
      this.roles = roles;
    });
  }

  fetchUserRoleDataList(){
    this.commonService.userRoleListData().subscribe((data) => {
      this.dataSource.data = data.sort(
        (a: any, b: any) => a.username.localeCompare(b.username) // just swap a & b
      );
    });
  }

  onSave() {
    if (this.userRoleForm.valid) {
      if (this.editingUserRole) {
        // Update existing user role
        const updatedUserRole = { ...this.editingUserRole, ...this.userRoleForm.value };
        const updatePayload = {
          username: updatedUserRole.username,
          roleId: updatedUserRole.roleId,
          reportsTo: updatedUserRole.reportsTo,
        };
  
        // Call backend to update user role
        this.commonService.updateUserRoles(updatedUserRole.id, updatePayload).subscribe(
          (response: any) => {
            // Fetch updated list from backend after successful update
            this.fetchUserRoleDataList();
            this.resetForm();
            this.snackBar.open('User role updated successfully!', 'Close', { duration: 2000 });
          },
          (error: any) => {
            console.error('Error updating user role:', error);
            this.snackBar.open('Error updating user role', 'Close', { duration: 2000 });
          }
        );
      } else {
        // Add new user role
        const newUserRole = { ...this.userRoleForm.value };
  
        // Call backend to save new user role
        this.commonService.saveUserRole(newUserRole).subscribe(
          (response: any) => {
            // Fetch updated list from backend after successful save
            this.fetchUserRoleDataList();
            this.snackBar.open('User role added successfully!', 'Close', { duration: 2000 });
          },
          (error: any) => {
            console.error('Error adding user role:', error);
            this.snackBar.open('Error adding user role', 'Close', { duration: 2000 });
          }
        );
      }
  
      this.resetForm();
      this.editingUserRole = null;
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 2000 });
    }
  }
  

  onCancel() {
    this.userRoleForm.reset();
    this.editingUserRole = null;
  }

  onEdit(userRole: any) {
    this.editingUserRole = userRole;
    this.userRoleForm.patchValue(userRole);
  }

  resetForm() {
    this.userRoleForm.reset();
    this.userRoleForm.markAsPristine();
    this.userRoleForm.markAsUntouched();
    Object.keys(this.userRoleForm.controls).forEach((key) => {
      const control = this.userRoleForm.get(key);
      if (control) {
        control.setErrors(null);
      }
    });
  }
}
