import { CommonModule } from '@angular/common';
import { Component,Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { CustomFieldDialogComponent } from '../../../custom-field-dialog/custom-field-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { TemplateManagementService } from '../../services/template-management.service';

@Component({
  selector: 'app-view-edit-template-dialog',
  standalone: true,
  imports: [FormsModule,CommonModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatButtonModule,MatDialogModule,MatListModule],
  templateUrl: './view-edit-template-dialog.component.html',
  styleUrl: './view-edit-template-dialog.component.scss'
})
export class ViewEditTemplateDialogComponent {
  isEditMode: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ViewEditTemplateDialogComponent>,
    private dialog: MatDialog,
    private templateService:TemplateManagementService
  ) {
    this.isEditMode = data.mode === 'edit';
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close(this.data.template);  
    
    this.templateService.updateTemplate(this.data.template.id,this.data.template).subscribe({
      next: (response) => {
          // Reload templates after saving
        alert('Template saved successfully!');
      },
      error: (error) => {
        console.error('Error saving template:', error);
        alert('Failed to save the template.');
      }
    });
  }

  addField(): void {
    const dialogRef = this.dialog.open(CustomFieldDialogComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.data.template.fields.push(result);
      }
    });
  }
}
