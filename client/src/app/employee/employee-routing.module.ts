import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { EmployeeHomeComponent } from "./employee-home/employee-home.component";
import { EmployeeProfileComponent } from "./employee-profile/employee-profile.component";
import { EmployeeScheduleComponent } from "./employee-schedule/employee-schedule.component";
import { LeaveRequestComponent } from "./leave-request/leave-request.component";
import { PtoHolidayComponent } from "./pto-holiday/pto-holiday.component";
import { EmployeeContactInfoComponent } from "./employee-contact-info/employee-contact-info.component";
import { EmployeeSpecialtiesComponent } from "./employee-specialties/employee-specialties.component";

const routes: Routes = [
  {
    path: '', 
    component: EmployeeHomeComponent,
    children: [
      { path: '', redirectTo: '/employee/schedule', pathMatch: 'full'},
      { path: 'profile', component: EmployeeProfileComponent },
      { path: 'schedule', component: EmployeeScheduleComponent },
      { path: 'ptoholidays', component: PtoHolidayComponent },
      { path: 'leaverequest', component: LeaveRequestComponent},
      { path: "contacts", component: EmployeeContactInfoComponent },
      { path: "specialties", component: EmployeeSpecialtiesComponent },
      { path: '**', component: EmployeeScheduleComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeeRoutingModule {}