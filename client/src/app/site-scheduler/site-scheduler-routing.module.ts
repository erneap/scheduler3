import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SiteAvailabilityComponent } from './site-availability/site-availability.component';
import { SiteMidScheduleComponent } from './site-mid-schedule/site-mid-schedule.component';
import { SiteScheduleComponent } from './site-schedule/site-schedule.component';
import { SiteSchedulerComponent } from './site-scheduler.component';
import { SiteScheduleAllComponent } from './site-schedule-all/site-schedule-all.component';

const routes: Routes = [
  {
    path: '', 
    component: SiteSchedulerComponent,
    children: [
      { path: '', redirectTo: '/siteschedule/schedule', pathMatch: 'full'},
      { path: 'schedule', component: SiteScheduleComponent },
      { path: 'scheduleall', component: SiteScheduleAllComponent },
      { path: 'coverage', component: SiteAvailabilityComponent },
      { path: 'mids', component: SiteMidScheduleComponent },
      { path: '**', component: SiteScheduleComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SiteSchedulerRoutingModule { }
