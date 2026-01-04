import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { CommonService } from '@shared/services/common.service';
import { Observable } from 'rxjs';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';


@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    FormsModule,
    MatPaginatorModule
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  roleName: string = '';
  shortRoleName: string = '';
  roles: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>(this.roles);
  displayedColumns: string[] = ['rolename', 'shortRoleName','actions'];

  constructor(private commonService: CommonService) {}

  ngOnInit(): void {
    this.getAllRoles();
  }

  ngAfterViewInit(): void {
    // Connect the paginator to the MatTableDataSource
    this.dataSource.paginator = this.paginator;
  }

  onSave() {
    // Find index of the existing role with the same roleName
    const existingRoleIndex = this.roles.findIndex(role => role.roleName === this.roleName);
  
    if (existingRoleIndex !== -1) {
      // If the role exists, update it
      const existingRole = this.roles[existingRoleIndex];
  
      // Update the local roles array
      this.roles[existingRoleIndex] = { 
        ...existingRole, // Keep other properties like `id`
        roleName: this.roleName, 
        shortRoleName: this.shortRoleName 
      };
  
      // Call the update service with the correct ID
      this.commonService.updateRoles(
        existingRole.id, // Use the existing role's ID
        { roleName: this.roleName, shortRoleName: this.shortRoleName }
      ).subscribe((res: any) => {
      
        this.getAllRoles(); // Refresh the roles list
      });
  
    } else {
      // If the role does not exist, add it
      const newRole = { 
        roleName: this.roleName, 
        shortRoleName: this.shortRoleName 
      };
  

  
      this.commonService.saveRole(newRole).subscribe((res: any) => {
        
        this.getAllRoles(); // Refresh the roles list
      });
  
      this.roles.push(newRole); // Add the new role to the local list
      this.dataSource.data = this.roles; // Update the dataSource with the new data
    }
  
    // Clear the form after saving/updating
    this.clearForm();
  }
  

  onCancel() {
    this.clearForm();
  }

  onRowClick(role: any) {
    this.roleName = role.roleName;
    this.shortRoleName = role.shortRoleName;
  }

  clearForm() {
    this.roleName = '';
    this.shortRoleName = '';
  }

  getAllRoles() {
    this.commonService.getAllRoles().subscribe((data) => {
      this.roles = data; // Update the roles array
      this.dataSource.data = this.roles; // Update the dataSource with the new data
      this.dataSource.paginator = this.paginator; // Reconnect the paginator
    });
  }

  onDelete(data:any){
    
  }
}
