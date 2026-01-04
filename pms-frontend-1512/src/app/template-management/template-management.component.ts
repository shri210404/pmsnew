import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CustomFieldDialogComponent } from '../custom-field-dialog/custom-field-dialog.component';
import { CommonModule } from '@angular/common';
import { TemplateManagementService } from './services/template-management.service';
import { CommonService } from '@shared/services/common.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ViewEditTemplateDialogComponent } from './viewEditTemplate/view-edit-template-dialog/view-edit-template-dialog.component'

@Component({
  selector: 'app-template-management',
  standalone: true,
  imports: [
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    CommonModule,
    MatTableModule
  ],
  templateUrl: './template-management.component.html',
  styleUrls: ['./template-management.component.scss']  // Fixed typo here
})
export class TemplateManagementComponent implements OnInit {
  templateForm: FormGroup;
  clients: any[] = [];
  locations: any[] = [];
  defaultLabels = [
    { fieldName: 'Name', fieldType: 'text', formControlName: 'candidateName' },
    { fieldName: 'Role applied', fieldType: 'text', formControlName: 'roleApplied' },
    { fieldName: 'Nationality', fieldType: 'text', formControlName: 'nationality' },
    { fieldName: 'Email', fieldType: 'email', formControlName: 'email' },
    { fieldName: 'Contact', fieldType: 'number', formControlName: 'contact' },
    { fieldName: 'Notice period', fieldType: 'number', formControlName: 'noticePeriod' },
    { fieldName: 'Passport validity', fieldType: 'date', formControlName: 'passportValidity' },
    { fieldName: 'Current salary', fieldType: 'number', formControlName: 'currentSalary' },
    { fieldName: 'Expected salary', fieldType: 'number', formControlName: 'expectedSalary' },
    { fieldName: 'Remarks', fieldType: 'text', formControlName: 'remarks' },
    { fieldName: 'Primary skills', fieldType: 'text', formControlName: 'primarySkills' },
    { fieldName: 'Current Location', fieldType: 'text', formControlName: 'currentlocation' },
    { fieldName: 'University', fieldType: 'text', formControlName: 'university' },
    { fieldName: 'Education Level', fieldType: 'dropdown', formControlName: 'educationLevel' },
    { fieldName: 'Visa Type', fieldType: 'text', formControlName: 'visaType' },
    { fieldName: 'Interview Avability', fieldType: 'text', formControlName: 'interviewAvaibale' },
    { fieldName: 'Total Years of Experience', fieldType: 'text', formControlName: 'totalYearsofExperience' },
    { fieldName: 'Revlavent Years of Experience', fieldType: 'text', formControlName: 'relaventsofExperience' },
    { fieldName: 'Gender', fieldType: 'dropdown', formControlName: 'gender' },
    { fieldName: 'Reason of Job Change', fieldType: 'textArea', formControlName: 'jobChange' },
    { fieldName: 'Passport', fieldType: 'text', formControlName: 'passport' },
    { fieldName: 'Cuurent Job Details', fieldType: 'textArea', formControlName: 'currentJobDetails' },
    { fieldName: 'Job Langauge', fieldType: 'dropDown', formControlName: 'jobLangauge' }, 
    { fieldName: 'Proficiency', fieldType: 'dropDown', formControlName: 'proficiency' },
    { fieldName: 'English Proficiency ', fieldType: 'dropDown', formControlName: 'proficiencyEnglish' },
  ];
  showLabels = false;
  templates: any[] = [];  // Store the list of saved templates
  displayedColumns: string[] = ['templateName', 'client', 'location', 'remarks','actions'];
  dataSource = new MatTableDataSource(this.templates);
  accountDetails: any ;
  

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private templateService: TemplateManagementService,
    private commonService: CommonService
  ) {
    this.templateForm = this.fb.group({
      client: ['', Validators.required],
      location: ['', Validators.required],
      templateName: ['', Validators.required],
      remarks: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCountries();
    this.loadClients();
    this.loadTemplates();  // Load saved templates
    this.accountDetails =localStorage.getItem('account-details')
    if (this.accountDetails) {
     this.accountDetails = JSON.parse(this.accountDetails).userdetails;
     
   }
  }

  loadCountries(): void {
    this.commonService.getCountries().subscribe(data => {
      this.locations = data;
    });
  }

  loadClients(): void {
    this.commonService.getClients().subscribe(data => {
      this.clients = data;
    });
  }

  loadTemplates(): void {
    this.templateService.getTemplates().subscribe(data => {
      this.templates = data;
      
      this.dataSource.data = this.templates;  // Update table data
    });
  }

  onArrowClick(): void {
    if (this.templateForm.valid) {
      this.showLabels = true;
    }
  }

  openCustomFieldModal(): void {
    const dialogRef = this.dialog.open(CustomFieldDialogComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        
        this.defaultLabels.push(result);
      }
    });
  }

  viewTemplate(template: any): void {
    this.dialog.open(ViewEditTemplateDialogComponent, {
      width: '400px',
      data: { template, mode: 'view' }
    });
  }

  editTemplate(template: any): void {
    this.dialog.open(ViewEditTemplateDialogComponent, {
      width: '400px',
      data: { template, mode: 'edit' }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.loadTemplates();  // Reload the table after editing
      }
    });
  }

  deleteTemplate(templateId: number): void {
    this.templateService.deleteTemplate(templateId).subscribe({
      next: () => {
        this.loadTemplates();  // Reload templates after deletion
      },
      error: (err) => console.error(err)
    });
  }

  saveTemplate(): void {
    const formData = {
      ...this.templateForm.value, 
      createdBy: this.accountDetails.id,
      fields: this.defaultLabels
    };

    this.templateService.saveTemplate(formData).subscribe({
      next: (response) => {
        this.loadTemplates();  // Reload templates after saving
        alert('Template saved successfully!');
      },
      error: (error) => {
        console.error('Error saving template:', error);
        alert('Failed to save the template.');
      }
    });
  }

  cancel(): void {
    this.templateForm.reset();
    this.showLabels = false;
    const defaultLabels = [
      { fieldName: 'fieldName', fieldType: 'text', formControlName: 'fieldName' },
      { fieldName: 'Role applied', fieldType: 'text', formControlName: 'roleApplied' },
      { fieldName: 'Nationality', fieldType: 'text', formControlName: 'nationality' },
      { fieldName: 'Email', fieldType: 'email', formControlName: 'email' },
      { fieldName: 'Contact', fieldType: 'number', formControlName: 'contact' },
      { fieldName: 'Notice period', fieldType: 'number', formControlName: 'noticePeriod' },
      { fieldName: 'Passport validity', fieldType: 'date', formControlName: 'passportValidity' },
      { fieldName: 'Current salary', fieldType: 'number', formControlName: 'currentSalary' },
      { fieldName: 'Expected salary', fieldType: 'number', formControlName: 'expectedSalary' },
      { fieldName: 'Remarks', fieldType: 'text', formControlName: 'remarks' },
      { fieldName: 'Primary skills', fieldType: 'text', formControlName: 'primarySkills' },
      { fieldName: 'Current Location', fieldType: 'text', formControlName: 'currentlocation' },
      { fieldName: 'University', fieldType: 'text', formControlName: 'university' },
      { fieldName: 'Education Level', fieldType: 'dropdown', formControlName: 'educationLevel' },
      { fieldName: 'Visa Type', fieldType: 'text', formControlName: 'visaType' },
      { fieldName: 'Interview Avability', fieldType: 'text', formControlName: 'interviewAvaibale' },
      { fieldName: 'Total Years of Experience', fieldType: 'text', formControlName: 'totalYearsofExperience' },
      { fieldName: 'Revlavent Years of Experience', fieldType: 'text', formControlName: 'relaventsofExperience' },
      { fieldName: 'Gender', fieldType: 'dropdown', formControlName: 'gender' },
      { fieldName: 'Reason of Job Change', fieldType: 'textArea', formControlName: 'jobChange' },
      { fieldName: 'Passport', fieldType: 'text', formControlName: 'passport' },
      { fieldName: 'Cuurent Job Details', fieldType: 'textArea', formControlName: 'currentJobDetails' },
      { fieldName: 'Job Langauge', fieldType: 'dropDown', formControlName: 'jobLangauge' }, 
      { fieldName: 'Proficiency', fieldType: 'dropDown', formControlName: 'proficiency' },
      { fieldName: 'English Proficiency ', fieldType: 'dropDown', formControlName: 'proficiencyEnglish' },
    ];
  }
}
