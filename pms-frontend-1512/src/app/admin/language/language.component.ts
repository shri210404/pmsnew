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
  selector: 'app-language',
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
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss']
})
export class LanguageComponent implements OnInit {
  language: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  languageName: string = '';
  displayedColumns: string[] = ['languageName', 'actions'];
  editingLanguageId: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private commonService: CommonService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getAllLanguages();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  onSave() {
    if (this.editingLanguageId) {
      this.commonService
        .updateLanguage(this.editingLanguageId, {
          id: this.editingLanguageId,
          languageName: this.languageName
        })
        .subscribe({
          next: () => {
            this.getAllLanguages();
            this.clearForm();
            this.snackBar.open('Language updated successfully!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to update language.', 'Close', { duration: 3000 });
          }
        });
    } else {
      this.commonService
        .saveLanguage({
          languageName: this.languageName
        })
        .subscribe({
          next: () => {
            this.getAllLanguages();
            this.clearForm();
            this.snackBar.open('Language added successfully!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to add language.', 'Close', { duration: 3000 });
          }
        });
    }
  }

  onCancel() {
    this.clearForm();
  }

  onRowClick(language: any) {
    this.languageName = language.languageName;
    this.editingLanguageId = language.id;
  }

  clearForm() {
    this.languageName = '';
    this.editingLanguageId = null;
  }

  getAllLanguages() {
    this.commonService.getLanguage().subscribe({
      next: (data) => {
        this.language = data;
        this.dataSource.data = this.language;
      },
      error: () => {
        this.snackBar.open('Failed to fetch languages.', 'Close', { duration: 3000 });
      }
    });
  }

  onDelete(languageId: any) {
    this.commonService.deletelanguage(languageId).subscribe({
      next: () => {
        this.getAllLanguages();
        this.snackBar.open('Language deleted successfully!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to delete language.', 'Close', { duration: 3000 });
      }
    });
  }
}
