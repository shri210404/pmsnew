import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonService } from '@shared/services/common.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

interface Employee {
  id: number;
  name: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTableModule,
    ReactiveFormsModule,
    MatIconModule,
    MatPaginatorModule,
  ],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
})
export class EmployeeComponent implements OnInit, AfterViewInit {
  employeeForm: FormGroup;
  employees: Employee[] = [];
  displayedColumns: string[] = [
    'employeeId',
    'username',
    'email',
    'firstName',
    'lastName',
    'actions',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>(this.employees);
  editingEmployee: Employee | null = null;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private commonService: CommonService
  ) {
    this.employeeForm = this.fb.group({
      employeeId: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.fetchEmployees();
  }

  ngAfterViewInit(): void {
    // Connect the paginator to the MatTableDataSource
    this.dataSource.paginator = this.paginator;
  }

  fetchEmployees() {
    this.commonService.getAllEmployee().subscribe((data) => {
      this.employees = data;
      this.dataSource.data = this.employees.sort(
        (a: any, b: any) => a.username.localeCompare(b.username) // just swap a & b
      );  // Set the data source
    });
  }

  onSave() {
    if (this.employeeForm.valid) {
      if (this.editingEmployee) {
        const updatedEmployee = {
          ...this.editingEmployee,
          ...this.employeeForm.value,
        };
        const index = this.employees.findIndex(
          (emp) => emp.id === this.editingEmployee!.id
        );
        if (index > -1) {
          this.employees[index] = updatedEmployee;
          this.dataSource.data = this.employees;
          this.commonService
            .updateEmployee(updatedEmployee.id, updatedEmployee)
            .subscribe((resp) => {
              
            });
          this.snackBar.open(
            'Employee details updated successfully!',
            'Close',
            { duration: 2000 }
          );
        }
        this.resetForm();
        this.editingEmployee = null;
      } else {
        const newEmployee = {
          id: this.employees.length + 1,
          ...this.employeeForm.value,
        };
        this.employees.push(newEmployee);
        this.dataSource.data = this.employees;
        const employeeToSave = { ...newEmployee };
        delete employeeToSave.id;

        this.commonService.saveEmploye(employeeToSave).subscribe((resp) => {
          
        });
        this.snackBar.open('Employee added successfully!', 'Close', {
          duration: 2000,
        });
      }
      this.resetForm();
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 2000,
      });
    }
  }

  onCancel() {
    this.resetForm();
    this.editingEmployee = null;
  }

  onEdit(employee: Employee) {
    this.editingEmployee = employee;
    this.employeeForm.patchValue(employee);
  }

  resetForm() {
    this.employeeForm.reset();
    this.employeeForm.markAsPristine();
    this.employeeForm.markAsUntouched();
    Object.keys(this.employeeForm.controls).forEach((key) => {
      const control = this.employeeForm.get(key);
      if (control) {
        control.setErrors(null);
      }
    });
  }
}
