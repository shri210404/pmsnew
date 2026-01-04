import { Component,Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-custom-field-dialog',
  standalone: true,
  imports: [MatDialogModule,MatFormFieldModule,MatInputModule,MatSelectModule,FormsModule,CommonModule,ReactiveFormsModule,MatButtonModule],
  templateUrl: './custom-field-dialog.component.html',
  styleUrl: './custom-field-dialog.component.scss'
})export class CustomFieldDialogComponent {
  customFieldForm: FormGroup;
  fieldTypes = ['Text', 'Number box'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CustomFieldDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.customFieldForm = this.fb.group({
      fieldName: ['', Validators.required],
      fieldType: ['', Validators.required],
      formControlName: ['']
    });

    // Listen for changes in fieldName and convert to camelCase
    this.customFieldForm.get('fieldName')?.valueChanges.subscribe(value => {
      if (value) {
        const camelCaseValue = this.toCamelCase(value);
        this.customFieldForm.get('formControlName')?.setValue(camelCaseValue, { emitEvent: false });
      }
    });
  }

  toCamelCase(value: string): string {
    return value
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => index === 0 ? match.toLowerCase() : match.toUpperCase())
      .replace(/\s+/g, '');
  }
  
  addCustomField() {
    if (this.customFieldForm.valid) {
      this.dialogRef.close(this.customFieldForm.value);
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
