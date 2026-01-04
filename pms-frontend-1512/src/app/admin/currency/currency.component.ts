import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CommonService } from '@shared/services/common.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatSnackBarModule,
    MatPaginatorModule,
    FormsModule
  ],
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss']
})
export class CurrencyComponent implements OnInit {
  currencyName: any = '';
  editingCurrencyId: any = null;
  displayedColumns: string[] = ['currencyName', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private commonService: CommonService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getAllCurrency();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator; // Attach paginator after view initialization
  }

  onSave() {
    if (this.editingCurrencyId) {
      // Update existing currency
      this.commonService
        .updateCurrency(this.editingCurrencyId, {
          id: this.editingCurrencyId,
          currencyName: this.currencyName
        })
        .subscribe({
          next: (resp) => {
            this.getAllCurrency();
            this.clearForm();
            this.snackBar.open('Currency updated successfully!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to update currency.', 'Close', { duration: 3000 });
          }
        });
    } else {
      // Add new currency
      this.commonService
        .saveCurrency({ currencyName: this.currencyName })
        .subscribe({
          next: (resp) => {
            this.getAllCurrency();
            this.clearForm();
            this.snackBar.open('Currency added successfully!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to add currency.', 'Close', { duration: 3000 });
          }
        });
    }
  }

  onCancel() {
    this.clearForm();
  }

  onDelete(currencyId: any) {
    this.commonService.deleteCurrency(currencyId).subscribe({
      next: () => {
        this.getAllCurrency();
        this.snackBar.open('Currency deleted successfully!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to delete currency.', 'Close', { duration: 3000 });
      }
    });
  }

  onRowClick(currency: any) {
    this.currencyName = currency.currencyName;
    this.editingCurrencyId = currency.id; // Set the ID for editing
  }

  clearForm() {
    this.currencyName = '';
    this.editingCurrencyId = null; // Reset editing state
  }

  getAllCurrency() {
    this.commonService.getCurrency().subscribe({
      next: (data) => {
        this.dataSource.data = data; // Update the table data
      },
      error: () => {
        this.snackBar.open('Failed to fetch currency data.', 'Close', { duration: 3000 });
      }
    });
  }
}
