import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { CommonService } from '@shared/services/common.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatSnackBarModule,
    FormsModule,
    MatPaginatorModule
  ],
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit, AfterViewInit {
  countryName: string = '';
  displayedColumns: string[] = ['countryName', 'actions'];
  editingCountryId: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]); // Initialize empty data source

  constructor(
    private commonService: CommonService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getAllCountry();
  }

  ngAfterViewInit(): void {
    // Connect the paginator to the MatTableDataSource
    this.dataSource.paginator = this.paginator;
  }

  onSave() {
    if (this.editingCountryId) {
      // Update existing country
      this.commonService
        .updateCountry(this.editingCountryId, {
          id: this.editingCountryId,
          countryName: this.countryName
        })
        .subscribe({
          next: () => {
            this.getAllCountry();
            this.clearForm();
            this.snackBar.open('Country updated successfully!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to update country.', 'Close', { duration: 3000 });
          }
        });
    } else {
      // Add new country
      this.commonService
        .saveCountry({ countryName: this.countryName })
        .subscribe({
          next: () => {
            this.getAllCountry();
            this.clearForm();
            this.snackBar.open('Country added successfully!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to add country.', 'Close', { duration: 3000 });
          }
        });
    }
  }

  onCancel() {
    this.clearForm();
  }

  onRowClick(country: any) {
    this.countryName = country.countryName;
    this.editingCountryId = country.id; // Set the ID for editing
  }

  onDelete(countryId: any) {
    this.commonService.deleteCountry(countryId).subscribe({
      next: () => {
        this.getAllCountry();
        this.snackBar.open('Country deleted successfully!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to delete country.', 'Close', { duration: 3000 });
      }
    });
  }

  clearForm() {
    this.countryName = '';
    this.editingCountryId = null; // Reset editing state
  }

  getAllCountry() {
    this.commonService.getCountries().subscribe({
      next: (data) => {
        this.dataSource.data = data.sort(
          (a: any, b: any) => a.countryName.localeCompare(b.countryName)
        ); // Update the table data
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage(); // Reset paginator to the first page
        }
      },
      error: () => {
        this.snackBar.open('Failed to fetch country data.', 'Close', { duration: 3000 });
      }
    });
  }
}
