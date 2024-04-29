import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { Assignment, Schedule } from 'src/app/models/employees/assignments';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { LaborCharge } from 'src/app/models/sites/laborcode';
import { ISite, Site } from 'src/app/models/sites/site';
import { Workcenter } from 'src/app/models/sites/workcenter';
import { ChangeAssignmentRequest, EmployeeResponse } from 'src/app/models/web/employeeWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';

@Component({
  selector: 'app-site-employees-assignment',
  templateUrl: './site-employees-assignment.component.html',
  styleUrls: ['./site-employees-assignment.component.scss']
})
export class SiteEmployeesAssignmentComponent {
  private _employee: Employee = new Employee();
  @Input()
  public set employee(iEmp: IEmployee) {
    this._employee = new Employee(iEmp);
    this.setAssignments();
  }
  get employee(): Employee {
    return this._employee;
  }
  private _site: Site = new Site();
  @Input()
  public set site(iSite: ISite) {
    this._site = new Site(iSite);
    this.setWorkcenters();
    this.setAssignments();
  }
  get site(): Site {
    return this._site;
  }
  @Input() height: number = 700;
  @Input() width: number = 1048;
  @Output() changed = new EventEmitter<Employee>();
  siteID: string = '';
  assignment: Assignment = new Assignment();
  schedule: Schedule = new Schedule();
  assignmentList: Assignment[] = [];
  workcenters: Workcenter[] = [];
  asgmtForm: FormGroup;
  showSchedule: boolean = false;
  rotatePeriods: string[] = new Array("28", "56", "84", "112", "140", "168", "336");
  laborcodes: LaborCharge[] = [];

  constructor(
    protected siteService: SiteService,
    protected empService: EmployeeService,
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.asgmtForm = this.fb.group({
      assignment: '0',
      workcenter: '',
      startdate: new Date(),
      enddate: new Date(9999, 11, 30),
      schedule: '0',
      rotationdate: new Date(),
      rotationdays: 0,
    });
    const iSite = this.siteService.getSite();
    if (iSite) {
      this.siteID = iSite.id;
      this.site = iSite;
      this.setWorkcenters();
    }
  }

  setWorkcenters() {
    this.workcenters = [];
    if (this.site.workcenters) {
      this.site.workcenters.forEach(wc => {
        this.workcenters.push(new Workcenter(wc));
      })
    }
  }

  setLaborCodes() {
    this.laborcodes = [];
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear() + 1, 11, 31);
    if (this.site && this.site.forecasts) {
      this.site.forecasts.forEach(f => {
        if (f.endDate.getTime() >= start.getTime() && f.startDate.getTime() <= end.getTime()) {
          if (f.laborCodes) {
            f.laborCodes.forEach(lc => {
              const newLc: LaborCharge = {
                chargenumber: lc.chargeNumber,
                extension: lc.extension,
                checked: false,
              }
              this.laborcodes.push(newLc);
            });
          }
        }
      });
    }
    this.laborcodes.sort((a,b) => {
      if (a.chargenumber === b.chargenumber) {
        return (a.extension < b.extension) ? -1 : 1;
      }
      return (a.chargenumber < b.chargenumber) ? -1 : 1;
    })
  }

  setAssignments() {
    this.assignmentList = [];
    this.showSchedule = false;
    let oldAsgmtID: number = -1;
    if (this.assignment && this.assignment.id > 0) {
      oldAsgmtID = this.assignment.id;
    }
    this.assignment = new Assignment();
    this.employee.assignments.forEach(asgmt => {
      if (asgmt.site.toLowerCase() === this.site.id.toLowerCase()) {
        this.assignmentList.push(new Assignment(asgmt));
        if (asgmt.id === oldAsgmtID) {
          this.assignment = new Assignment(asgmt);
        }
      }
    });
    this.assignmentList.sort((a,b) => b.compareTo(a));
    if (oldAsgmtID < 0 && this.assignmentList.length > 0) {
      this.assignment = this.assignmentList[0];
    }
    this.setAssignment();
  }

  setAssignment() {
    let schID: number = 0;
    if (this.schedule && this.schedule.id > 0) {
      schID = this.schedule.id;
    }
    this.setLaborCodes();
    this.showSchedule = (this.assignment.schedules.length > 0);
    if (this.assignment.schedules.length > 0) {
      this.assignment.schedules.forEach(sch => {
        if (sch.id === schID) {
          this.schedule = sch;
        }
      });
    } 
    this.asgmtForm.controls["assignment"].setValue(this.asgmtID(this.assignment));
    this.asgmtForm.controls["workcenter"].setValue(this.assignment.workcenter);
    this.asgmtForm.controls["startdate"].setValue(
      new Date(this.assignment.startDate));
    this.asgmtForm.controls["enddate"].setValue(
      new Date(this.assignment.endDate));
    if (this.schedule) {
      this.asgmtForm.controls["schedule"].setValue(this.schedID(this.schedule));
    } else {
      this.asgmtForm.controls["schedule"].setValue('');
    }
    this.asgmtForm.controls["rotationdate"].setValue(
      new Date(this.assignment.rotationdate));
    this.asgmtForm.controls["rotationdays"].setValue(
      `${this.assignment.rotationdays}`);
    if (this.assignment.laborcodes) {
      this.assignment.laborcodes.forEach(alc => {
        for (let i=0; i < this.laborcodes.length; i++) {
          const lc = this.laborcodes[i];
          if (alc.chargeNumber === lc.chargenumber && alc.extension === lc.extension) {
            lc.checked = true;
            this.laborcodes[i] = lc;
          }
        }
      })
    }
  }
  
  selectAssignment() {
    const id = Number(this.asgmtForm.value.assignment);
    this.assignment = new Assignment();
    this.employee.assignments.forEach(asgmt => {
      if (asgmt.id === id) {
        this.assignment = new Assignment(asgmt);
      }
    });
    this.setAssignment();
  }

  changeSchedule() {
    let schedID = Number(this.asgmtForm.value.schedule);
    this.assignment.schedules.forEach(sch => {
      if (sch.id === schedID) {
        this.schedule = new Schedule(sch);
      }
    });
  }

  getDateString(date: Date) {
    if (date.getFullYear() !== 9999) {
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
    return '';
  }

  getYearFirstDate(date: Date): string {
    date = new Date(date);
    let answer =  `${date.getFullYear()}-`;
    if (date.getMonth() + 1 < 10) {
      answer += '0';
    }
    answer += `${date.getMonth() + 1}-`;
    if (date.getDate() < 10) {
      answer += '0';
    }
    answer += `${date.getDate()}`;
    return answer;
  }

  asgmtID(asgmt: Assignment): string {
    return `${asgmt.id}`;
  }

  schedID(sch: Schedule): string {
    return `${sch.id}`;
  }

  updateField(field: string) {
    let asgmtid = Number(this.asgmtForm.value.assignment);
    if (asgmtid > 0) {
      var value: any;
      switch (field.toLowerCase()) {
        case "workcenter":
          value = this.asgmtForm.value.workcenter;
          break;
        case "startdate":
          value = this.getYearFirstDate(this.asgmtForm.value.startdate);
          break;
        case "enddate":
          value = this.getYearFirstDate(this.asgmtForm.value.enddate);
          break;
        case "addschedule":
          value = '7';
          break;
        case "rotationdate":
          value = this.getYearFirstDate(this.asgmtForm.value.rotationdate);
          break;
        case "rotationdays":
          value = `${this.asgmtForm.value.rotationdays}`;
          break;
      }
      this.dialogService.showSpinner();
      this.authService.statusMessage = `Updating Employee Assignment -`
        + `${field.toUpperCase()}`;
      this.empService.updateAssignment(this.employee.id, asgmtid, field, value)
        .subscribe({
          next: (data: EmployeeResponse) => {
            this.dialogService.closeSpinner();
            let schID = this.schedule.id;
            if (data && data !== null) {
              if (data.employee) {
                this.employee = new Employee(data.employee);
                this.employee.assignments.forEach(agmt => {
                  if (agmt.id === this.assignment.id) {
                    this.assignment = new Assignment(agmt);
                    this.setAssignment();
                    if (field.toLowerCase() === "addschedule") {
                      this.assignment.schedules.sort((a,b) => a.compareTo(b));
                      this.schedule = this.assignment.schedules[
                        this.assignment.schedules.length - 1];
                    } else {
                      this.assignment.schedules.forEach(sch => {
                        if (sch.id === schID) {
                          this.schedule = new Schedule(sch);
                          this.asgmtForm.controls['schedule'].setValue(`${sch.id}`);
                        }
                      });
                    }
                  }
                });
              }
            }
            this.changed.emit(new Employee(this.employee));
            this.authService.statusMessage = "Update complete";
          },
          error: (err: EmployeeResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        })
    }
  }

  updateSchedule(data: string) {
    if (typeof(data) === 'string') {
      const chgParts = data.split("|");
      const change: ChangeAssignmentRequest = {
        employee: this.employee.id,
        asgmt: this.assignment.id,
        schedule: Number(chgParts[1]),
        field: chgParts[3],
        value: chgParts[4],
      }
      let asgmtID = change.asgmt;
      let schID = change.schedule;
      
      if (chgParts[0].toLowerCase() === 'schedule') {
        if (change.field.toLowerCase() === 'removeschedule') {
          this.authService.statusMessage = "Removing Employee Assignment "
            + 'Schedule';
        } else {
          this.authService.statusMessage = `Updating Employee Assignment -`
            + `Schedule Days`;
        }
        this.dialogService.showSpinner();
        this.empService.updateAssignmentSchedule(change)
          .subscribe({
            next: (data: EmployeeResponse) => {
              this.dialogService.closeSpinner();
              if (data && data !== null) {
                if (data.employee) {
                  this.employee = new Employee(data.employee);
                  this.employee.assignments.forEach(agmt => {
                    if (agmt.id === asgmtID) {
                      this.assignment = new Assignment(agmt);
                      this.setAssignment();
                      let found = false;
                      this.assignment.schedules.forEach(sch => {
                        if (schID && sch.id === schID) {
                          this.schedule = new Schedule(sch);
                          this.asgmtForm.controls['schedule'].setValue(`schID`);
                          found = true;
                        }
                      });
                      if (!found) {
                        this.schedule = this.assignment.schedules[0];
                        this.asgmtForm.controls['schedule'].setValue('0');
                      }
                    }
                  });
                }
              }
              this.changed.emit(new Employee(this.employee));
              this.authService.statusMessage = "Update complete";
            },
            error: (err: EmployeeResponse) => {
              this.dialogService.closeSpinner();
              this.authService.statusMessage = err.exception;
            }
          });
      } else {
        change.workday = Number(chgParts[2]);
        this.dialogService.showSpinner();
        this.authService.statusMessage = `Updating Employee Assignment -`
          + `Schedule Days`;
        this.empService.updateAssignmentWorkday(change)
          .subscribe({
            next: (data: EmployeeResponse) => {
              this.dialogService.closeSpinner();
              if (data && data !== null) {
                if (data.employee) {
                  this.employee = new Employee(data.employee);
                  this.employee.assignments.forEach(agmt => {
                    if (agmt.id === asgmtID) {
                      this.assignment = new Assignment(agmt);
                      this.setAssignment();
                    }
                  });
                }
              }
              this.changed.emit(new Employee(this.employee));
              this.authService.statusMessage = "Update complete";
            },
            error: (err: EmployeeResponse) => {
              this.dialogService.closeSpinner();
              this.authService.statusMessage = err.exception;
            }
          });
      }
    }
  }

  addAssignment() {
    const wkctr = this.asgmtForm.value.workcenter;
    let start = new Date(this.asgmtForm.value.startdate);
    start = new Date(Date.UTC(start.getFullYear(), start.getMonth(), 
      start.getDate(), 0, 0, 0, 0))
    let siteID = '';
    let empID = this.employee.id;
    const site = this.siteService.getSite();
    if (site) {
      siteID = site.id;
    }
    this.authService.statusMessage = 'Adding new assignment'
    this.empService.AddAssignment(empID, siteID, wkctr, start, 7)
      .subscribe({
        next: (data: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            if (data.employee) {
              this.employee = new Employee(data.employee);
              this.employee.assignments.sort((a,b) => a.compareTo(b));
              this.assignment = new Assignment(this.employee.assignments[
                this.employee.assignments.length - 1]);
              this.schedule = this.assignment.schedules[0];
            }
          }
          this.changed.emit(new Employee(this.employee));
          this.authService.statusMessage = "Update complete";
        },
        error: (err: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      })
  }

  clearAssignment() {
    this.asgmtForm.controls['workcenter'].setValue('');
    this.asgmtForm.controls['startdate'].setValue(new Date());
    this.asgmtForm.controls['enddate'].setValue(new Date(Date.UTC(9999, 11, 30)));
    this.asgmtForm.controls['schedule'].setValue('0');
    this.asgmtForm.controls['rotationdate'].setValue(new Date());
    this.asgmtForm.controls['rotationdays'].setValue(0);
  }

  deleteAssignment() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Assignment Deletion', 
      message: 'Are you sure you want to delete this assignment?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.dialogService.showSpinner();
        this.authService.statusMessage = "Deleting Employee Assignment";
        this.empService.deleteAssignment(this.employee.id, this.assignment.id)
          .subscribe({
            next: (data: EmployeeResponse) => {
              this.dialogService.closeSpinner();
              if (data && data !== null) {
                if (data.employee) {
                  this.employee = new Employee(data.employee);
                  this.employee.assignments.sort((a,b) => a.compareTo(b));
                  this.assignment = new Assignment(this.employee.assignments[
                    this.employee.assignments.length - 1]);
                  this.schedule = this.assignment.schedules[0];
                }
              }
              this.changed.emit(new Employee(this.employee));
              this.authService.statusMessage = "Deletion complete";
            },
            error: (err: EmployeeResponse) => {
              this.dialogService.closeSpinner();
              this.authService.statusMessage = err.exception;
            }
          });
      }
    })
  }
  
  onSelect(chgNo: string, ext: string, event: MatCheckboxChange) {
    if (event.checked) {
      this.empService.addLaborCode(this.employee.id, this.assignment.id, 
        chgNo, ext)
      .subscribe({
        next: (data: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            if (data.employee) {
              this.employee = new Employee(data.employee);
              this.setLaborCodes();
            }
            const emp = this.empService.getEmployee();
            if (data.employee && emp && emp.id === data.employee.id) {
              this.empService.setEmployee(data.employee);
            }
          }
          this.changed.emit(new Employee(this.employee));
          this.authService.statusMessage = "Update complete";
        },
        error: (err: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    } else {
      this.empService.removeLaborCode(this.employee.id, this.assignment.id, 
        chgNo, ext)
      .subscribe({
        next: (data: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            if (data.employee) {
              this.employee = new Employee(data.employee);
              this.setLaborCodes();
            }
            const emp = this.empService.getEmployee();
            if (data.employee && emp && emp.id === data.employee.id) {
              this.empService.setEmployee(data.employee);
            }
          }
          this.changed.emit(new Employee(this.employee));
          this.authService.statusMessage = "Update complete";
        },
        error: (err: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
  }
}
