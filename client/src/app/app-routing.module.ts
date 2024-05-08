import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './home/not-found/not-found.component';
import { NewSiteComponent } from './site/new-site/new-site.component';
import { SiteComponent } from './site/site.component';
import { TeamSiteEditorComponent } from './team/team-site-editor/team-site-editor.component';
import { FileIngestComponent } from './site-ingest/file-ingest/file-ingest.component';
import { TeamListEditorComponent } from './admin-actions/team-list-editor/team-list-editor.component';
import { TeamComponent } from './team/team.component';
import { DataPurgeComponent } from './admin-actions/data-purge/data-purge.component';
import { ReportsComponent } from './reports/reports.component';
import { NotificationsComponent } from './employee/notifications/notifications.component';
import { ForgotPasswordComponent } from './home/forgot-password/forgot-password.component';
import { ForgotPasswordResetComponent } from './home/forgot-password-reset/forgot-password-reset.component';
import { LogViewerComponent } from './log-viewer/log-viewer.component';
import { QueryComponent } from './query/query.component';
import { SiteModReportViewComponent } from './site/site-mod-report-view/site-mod-report-view.component';
import { SiteScheduleComponent } from './site/site-schedule/site-schedule/site-schedule.component';
import { SiteEmployeesComponent } from './site/site-employees/site-employees/site-employees.component';
import { SiteScheduleCoverageComponent } from './site/site-schedule/site-schedule-coverage/site-schedule-coverage.component';
import { SiteScheduleMidsListComponent } from './site/site-schedule/site-schedule-mids-list/site-schedule-mids-list.component';
import { SiteEmployeesLeaveApprovalComponent } from './site/site-employees/site-employees-leave-approval/site-employees-leave-approval.component';
import { SiteIngestComponent } from './site/site-ingest/site-ingest.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'reset/start', component: ForgotPasswordComponent },
  { path: 'reset/finish', component: ForgotPasswordResetComponent },
  { path: 'employee', 
    loadChildren: () => import('./employee/employee.module')
      .then(m => m.EmployeeModule) 
  },
  { path: 'siteschedule',
    loadChildren: () => import('./site-scheduler/site-scheduler.module')
      .then(m => m.SiteSchedulerModule)
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
      { path: 'ingest', component: SiteIngestComponent }
    ]
  },
  { path: 'siteemployees', component: SiteEmployeesComponent },
  { path: 'newsite', component: NewSiteComponent },
  { path: 'siteeditor', component: SiteComponent},
  { path: 'ingest/files', component: FileIngestComponent },
  { path: 'team/siteeditor', component: TeamSiteEditorComponent},
  { path: 'team/editor', component: TeamComponent },
  { path: 'admin/teams', component: TeamListEditorComponent },
  { path: 'admin/purge', component: DataPurgeComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'logs', component: LogViewerComponent },
  { path: 'query', component: QueryComponent },
  { path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
