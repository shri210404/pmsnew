import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { TemplateManagementComponent } from './template-management/template-management.component';
import { SubmissionManagementComponent } from './submission-management/submission-management.component';
import { ProposalManagementComponent } from './proposal-management/proposal-management.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from '@shared/guards/auth.guard';
import { RoleGuard } from '@shared/guards/role.guard';
import { MyReportsComponent } from './my-reports/my-reports.component';
import { RolesComponent } from './admin/roles/roles.component';
import { ClientComponent } from './admin/client/client.component';
import { CountryComponent } from './admin/country/country.component';
import { EmployeeComponent } from './admin/employee/employee.component';
import { UserRolesComponent } from './admin/user-roles/user-roles.component';
import { UserClientComponent } from './admin/user-client/user-client.component';
import { ProfileManagementComponent } from './profile-management/profile-management.component';
import { AddEditProfileComponent } from './profile-management/add-edit-profile/add-edit-profile.component';
import { EmailCheckerComponent } from './email-checker/email-checker.component';
import { LanguageComponent } from './admin/language/language.component';
import { CurrencyComponent } from './admin/currency/currency.component';
import { ForgetPasswordComponent } from '@shared/components/forget-password/forget-password.component';
import { ResetPasswordComponent } from '@shared/components/reset-password/reset-password.component';
import { FutureJobsComponent } from './future-jobs/future-jobs.component';
import { FutureJobsFormComponent } from './future-jobs/future-jobs-form/future-jobs-form.component';
import { JobOrderListComponent } from './job-order/job-order-list.component';
import { JobOrderCreateComponent } from './job-order/job-order-create.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forget-password', component: ForgetPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'app',
    component: LayoutComponent,
    // Apply AuthGuard and RoleGuard to all child routes
    canActivate: [AuthGuard, RoleGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'submission', component: SubmissionManagementComponent },
      {
        path: 'proposal',
        component: ProfileManagementComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'reports',
        component: MyReportsComponent,
      },
      {
        path: 'future-jobs',
        component: FutureJobsComponent,
      },
      {
        path: 'future-jobs-form',
        component: FutureJobsFormComponent,
      },
      {
        path: 'set-roles',
        component: RolesComponent,
      },
      {
        path: 'add-client',
        component: ClientComponent,
      },
      {
        path: 'add-language',
        component: LanguageComponent,
      },
      {
        path: 'add-currency',
        component: CurrencyComponent,
      },
      {
        path: 'add-country',
        component: CountryComponent,
      },
      {
        path: 'add-employee',
        component: EmployeeComponent,
      },
      {
        path: 'set-user-roles',
        component: UserRolesComponent,
      },
      {
        path: 'add-user-client',
        component: UserClientComponent,
      },
      { 
        path: 'add-new-profile', 
        component: AddEditProfileComponent 
      },
      { 
        path: 'email-check', 
        component: EmailCheckerComponent 
      },
      {
        path: 'job-order',
        component: JobOrderListComponent,
      },
      {
        path: 'job-order/create',
        component: JobOrderCreateComponent,
      },
    ],
  },
];
