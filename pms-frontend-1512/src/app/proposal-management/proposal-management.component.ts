import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import { CommonService } from '@shared/services/common.service';
import { ProposalManagementService } from './services/proposal-management.service';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ProposalModalComponent } from './proposal-modal/proposal-modal.component';
import { MatTabsModule } from "@angular/material/tabs";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogModule } from "@angular/material/dialog";
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@shared/base/base.component';

const fieldOrder = [
  'candidateName',
  'email',
  'passportValidity',
  'contact',
  'roleApplied',
  'currentSalary',
  'expectedSalary',
  'status',
  'primarySkills',
  'nationality',
  'noticePeriod',
  'visaType',
  'currentlocation',
  'educationLevel',
  'university',
  'proposedTo',
  'remarks',
  'interviewAvaibale'
];

@Component({
  selector: 'app-proposal-management',
  templateUrl: './proposal-management.component.html',
  styleUrl: './proposal-management.component.scss',
  standalone: true,
  imports: [
    MatFormFieldModule, MatSelectModule, MatInputModule, ReactiveFormsModule,
    MatDatepickerModule, MatButtonModule, CommonModule, MatTableModule, FormsModule, MatTabsModule, MatIconModule, MatDialogModule
  ]
})

export class ProposalManagementComponent extends BaseComponent implements OnInit {
  proposalForm: FormGroup;
  templates: any[] = [];
  selectedTemplate: any = null;
  selectedFields: any[] = [];
  selectedFile: File | null = null;
  statusOptions: string[] = ['PROPOSED', 'REJECTED', 'IN_PROCESS', 'SELECTED'];

  clients: string[] = [];
  locations: string[] = [];
  remarks: string | null = null;

  // Flags to control visibility of the other fields
  showDetails: boolean = false;
  loadProposal: any[] = [];
  displayedColumns: string[] = ['candidateName', 'clientName', 'location', 'remarks', 'actions'];
  accountDetails: any;
  proposedTo: string = '';
  userRole: any;
  groupedFields: any = {
    personalInformation: [],
    jobDetails: [],
    skills: [],
    salaryAndEmployment: [],
    others: [],
  };
  hideListing: boolean = false;

  constructor(private fb: FormBuilder, private dialog: MatDialog,
    private http: HttpClient, private commonService: CommonService, private proposalService: ProposalManagementService) {
    super();
    this.proposalForm = this.fb.group({});

  }

  ngOnInit(): void {
    this.loadTemplates();
    this.getAllProposal();
    this.getUserRoleList();
    this.accountDetails = localStorage.getItem('account-details')
    if (this.accountDetails) {
      this.accountDetails = JSON.parse(this.accountDetails).userdetails;
    }

  }

  onView(proposal: any, event?: Event): void {
    console.log('=== onView START ===', proposal);
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      console.log('Event prevented and stopped');
    }
    
    // Force stop any navigation
    if (event && event.target) {
      (event.target as HTMLElement).blur();
    }
    
    console.log('Opening dialog...');
    try {
      const dialogRef = this.dialog.open(ProposalModalComponent, {
        width: '80%',
        height: '600px',
        maxWidth: '100vw',
        maxHeight: '100vh',
        data: { ...proposal, mode: 'view' }
      });
      console.log('Dialog opened successfully:', dialogRef);
    } catch (error) {
      console.error('Error opening dialog:', error);
      alert('Error opening dialog: ' + error);
    }
    console.log('=== onView END ===');
  }

  onEdit(proposal: any, event?: Event): void {
    console.log('=== onEdit START ===', proposal);
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      console.log('Event prevented and stopped');
    }
    
    // Force stop any navigation
    if (event && event.target) {
      (event.target as HTMLElement).blur();
    }
    
    console.log('Opening dialog...');
    try {
      const dialogRef = this.dialog.open(ProposalModalComponent, {
        width: '80%',
        height: '600px',
        maxWidth: '100vw',
        maxHeight: '100vh',
        data: { ...proposal, mode: 'edit' }
      });
      console.log('Dialog opened successfully:', dialogRef);
      dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
        if (result) {
          this.getAllProposal(); // Refresh the list after edit
        }
      });
    } catch (error) {
      console.error('Error opening dialog:', error);
      alert('Error opening dialog: ' + error);
    }
    console.log('=== onEdit END ===');
  }

  showListing() {
    this.showDetails = false;
    this.hideListing = false;
  }

  loadTemplates(): void {
    this.commonService.getTemplates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.templates = data;
      });
  }

  getAllProposal(): void {
    this.proposalService.getProposal()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.loadProposal = data.map(proposal => ({ ...proposal, isEdit: false }));
        
      });
  }

  getUserRoleList(): void {
    this.proposalService.getUserList()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.userRole = data;
      });
    
  }

  // onEdit(proposal: any): void {
  //   proposal.isEdit = true;
  // }

  onSave(proposal: any, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    proposal.isEdit = false;

    // Call save API to update the proposal
    this.proposalService.updateProposal(proposal.id, proposal)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        response => {
          
        }, error => {
          
        });
  }

  onDelete(id: number, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    // Call delete API to remove the proposal
    this.proposalService.deleteProposal(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        this.loadProposal = this.loadProposal.filter(p => p.id !== id);
        
      }, error => {
        
      });
  }

  onTemplateChange(template: any) {
    this.hideListing = true;
    if (template) {
      this.commonService.getTemplateByName(template.templateName)
        .pipe(takeUntil(this.destroy$))
        .subscribe(response => {
        this.selectedTemplate = response;
        this.clients = [response.client];
        this.locations = [response.location];
        this.remarks = response.remarks;
        this.selectedFields = response.fields;
        /* this.selectedFields.sort((a, b) => {
          return fieldOrder.indexOf(a.formControlName) - fieldOrder.indexOf(b.formControlName);
        }); */

        response.fields.forEach((field: any) => {
          if (["candidateName", "nationality", "email", "contact", "passport", "passportValidity", "currentlocation", "gender"].includes(field.formControlName)) {
            this.groupedFields.personalInformation.push(field);
          }

          if (["roleApplied", "noticePeriod", "totalYearsofExperience", "relaventsofExperience", "jobLangauge", "jobChange"].includes(field.formControlName)) {
            this.groupedFields.jobDetails.push(field);
          }

          if (["primarySkills", "proficiency", "proficiencyEnglish"].includes(field.formControlName)) {
            this.groupedFields.skills.push(field);
          }

          if (["currentSalary", "expectedSalary", "currentJobDetails"].includes(field.formControlName)) {
            this.groupedFields.salaryAndEmployment.push(field);
          }

          if (["remarks", "visaType", "interviewAvaibale", "university", "educationLevel"].includes(field.formControlName)) {
            this.groupedFields.others.push(field);
          }
        });

        // Dynamically add controls to the form based on the template fields
        this.proposalForm = this.fb.group({});
        this.selectedFields.forEach(field => {
          this.proposalForm.addControl(field.formControlName, this.fb.control(''));
        });

        

        // Show other details once the template is selected
        this.showDetails = true;
      });
    } else {
      this.showDetails = false;
    }
  }

  errorMessage: string | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      ];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Only PDF, Word (.doc, .docx) files are allowed.';
        return;
      }

      // Check file size (2 MB)
      const maxSize = 2 * 1024 * 1024; // 2 MB
      if (file.size > maxSize) {
        this.errorMessage = 'File size must be less than 2 MB.';
        return;
      }

      this.selectedFile = file;
      // Clear error message if the file is valid
      this.errorMessage = null;

      
    }
  }

  onSubmit(): void {
    if (this.proposalForm.valid) {
      const formData = this.proposalForm.value;
      const submissionData = {
        ...formData,
        templateName: this.selectedTemplate.templateName,
        clientName: this.selectedTemplate.client,
        location: this.selectedTemplate.location,
        remarks: this.remarks,
        createdBy: this.accountDetails.id,
        proposedTo: this.proposedTo,
      };

      const formPayload = new FormData();

      // Append form data fields (not as JSON)
      Object.keys(submissionData).forEach((keyName) => {
        formPayload.append(keyName, submissionData[keyName]);
      });

      // Append the file if selected
      if (this.selectedFile) {
        formPayload.append('file', this.selectedFile);
      }

      // Submit the form data via service
      this.proposalService.saveProposal(formPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (response) => {
            
            this.getAllProposal();  // Fetch all proposals after submission
            this.onCancel();  // Clear the form after submission
          },
          (error) => {
            
          }
        );
    } else {
      
    }
  }


  onCancel(): void {
    this.proposalForm.reset();
    this.selectedFile = null;
    this.selectedTemplate = null;
    this.showDetails = false;
  }
}

