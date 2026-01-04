import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { CommonService } from '@shared/services/common.service';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSnackBarModule,
    FormsModule
  ],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  clientName: string = '';
  displayedColumns: string[] = ['clientName', 'actions'];
  editingClientId: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private commonService: CommonService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getAllClient();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  onSave() {
    if (this.editingClientId) {
      this.commonService
        .updateClient(this.editingClientId, {
          id: this.editingClientId,
          clientName: this.clientName
        })
        .subscribe({
          next: () => {
            this.getAllClient();
            this.clearForm();
            this.snackBar.open('Client updated successfully!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to update client.', 'Close', { duration: 3000 });
          }
        });
    } else {
      this.commonService
        .saveClient({ clientName: this.clientName })
        .subscribe({
          next: () => {
            this.getAllClient();
            this.clearForm();
            this.snackBar.open('Client added successfully!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to add client.', 'Close', { duration: 3000 });
          }
        });
    }
  }

  onCancel() {
    this.clearForm();
  }

  onRowClick(client: any) {
    this.clientName = client.clientName;
    this.editingClientId = client.id;
  }

  clearForm() {
    this.clientName = '';
    this.editingClientId = null;
  }

  getAllClient() {
    this.commonService.getClients().subscribe({
      next: (data) => {
        this.dataSource.data = data.sort(
          (a: any, b: any) => a.clientName.localeCompare(b.clientName) // just swap a & b
        );
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      },
      error: () => {
        this.snackBar.open('Failed to fetch clients.', 'Close', { duration: 3000 });
      }
    });
  }

  onDelete(clientId: any) {
    this.commonService.deleteClient(clientId).subscribe({
      next: () => {
        this.getAllClient();
        this.snackBar.open('Client deleted successfully!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to delete client.', 'Close', { duration: 3000 });
      }
    });
  }
}
