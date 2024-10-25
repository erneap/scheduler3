import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './home/not-found/not-found.component';
import { SiteComponent } from './site/site.component';
import { ReportsComponent } from './reports/reports.component';
import { NotificationsComponent } from './employee/notifications/notifications.component';
import { ForgotPasswordComponent } from './home/forgot-password/forgot-password.component';
import { ForgotPasswordResetComponent } from './home/forgot-password-reset/forgot-password-reset.component';
import { QueryComponent } from './query/query.component';
import { SiteModReportViewComponent } from './site/site-mod-report-view/site-mod-report-view.component';
import { SiteScheduleComponent } from './site/site-schedule/site-schedule/site-schedule.component';
import { SiteEmployeesComponent } from './site/site-employees/site-employees.component';
import { SiteScheduleCoverageComponent } from './site/site-schedule/site-schedule-coverage/site-schedule-coverage.component';
import { SiteScheduleMidsListComponent } from './site/site-schedule/site-schedule-mids-list/site-schedule-mids-list.component';
import { SiteEmployeesLeaveApprovalComponent } from './site/site-employees/site-employees-leave-approval/site-employees-leave-approval.component';
import { SiteIngestComponent } from './site/site-ingest/site-ingest.component';
import { TeamEditorComponent } from './team/team-editor/team-editor.component';
import { AdminComponent } from './admin/admin.component';
import { LogsComponent } from './logs/logs.component';
import { EmployeeProfileComponent } from './employee/employee-profile/employee-profile.component';
import { EmployeeScheduleComponent } from './employee/employee-schedule/employee-schedule.component';
import { EmployeePtoholidaysComponent } from './employee/employee-ptoholidays/employee-ptoholidays.component';
import { EmployeeLeaveRequestComponent } from './employee/employee-leave-request/employee-leave-request.component';
import { EmployeeContactInfoComponent } from './employee/employee-contact-info/employee-contact-info.component';
import { EmployeeSpecialtiesComponent } from './employee/employee-specialties/employee-specialties.component';
import { ReportArchiveComponent } from './report-archive/report-archive.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'reset/start', component: ForgotPasswordComponent },
  { path: 'reset/finish', component: ForgotPasswordResetComponent },
  { path: 'employee', 
    children: [
      { path: '', redirectTo: '/employee/schedule', pathMatch: 'full'},
      { path: 'profile', component: EmployeeProfileComponent },
      { path: 'schedule', component: EmployeeScheduleComponent },
      { path: 'ptoholidays', component: EmployeePtoholidaysComponent },
      { path: 'leaverequest', component: EmployeeLeaveRequestComponent },
      { path: "contacts", component: EmployeeContactInfoComponent },
      { path: "specialties", component: EmployeeSpecialtiesComponent },
      { path: '**', component: EmployeeScheduleComponent },
    ]
  },
  { path: 'site', 
    children: [
      { path: 'schedule', 
        children: [
          { path: 'schedule', component: SiteScheduleComponent },
          { path: 'coverage', component: SiteScheduleCoverageComponent },
          { path: 'mids', component: SiteScheduleMidsListComponent },
          { path: '**', component: SiteScheduleComponent }
        ]
      },
      { path: 'employees',
        children: [
          { path: 'editor', component: SiteEmployeesComponent },
          { path: 'leaveapprover', 
            component: SiteEmployeesLeaveApprovalComponent },
          { path: '**', component: SiteEmployeesComponent }
        ]
      },
      { path: 'modview', component: SiteModReportViewComponent },
      { path: 'ingest', component: SiteIngestComponent },
      { path: 'editor', component: SiteComponent },
      { path: '**', redirectTo: '/site/schedule/schedule'}
    ]
  },
  { path: 'team', 
    children: [
      {path: 'editor', component: TeamEditorComponent }
    ]
  },
  { path: 'admin',
    children: [
      { path: 'reports', component: ReportsComponent },
      { path: 'logs', component: LogsComponent },
      { path: '**', component: AdminComponent } 
    ]
  },
  
  { path: 'notifications', component: NotificationsComponent },
  { path: 'query', component: QueryComponent },
  { path: 'archive', component: ReportArchiveComponent },
  { path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
