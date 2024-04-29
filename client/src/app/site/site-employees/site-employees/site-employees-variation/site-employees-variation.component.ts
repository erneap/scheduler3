import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { Schedule, Variation } from 'src/app/models/employees/assignments';
import { Employee, IEmployee } from 'src/app/models/employees/employee';
import { ISite, Site } from 'src/app/models/sites/site';
import { ChangeAssignmentRequest, EmployeeResponse } from 'src/app/models/web/employeeWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';

@Component({
  selector: 'app-site-employees-variation',
  templateUrl: './site-employees-variation.component.html',
  styleUrls: ['./site-employees-variation.component.scss']
})
export class SiteEmployeesVariationComponent {
  private _employee: Employee = new Employee();
  @Input()
  public set employee(iEmp: IEmployee) {
    this._employee = new Employee(iEmp);
    this.setVariationLists();
    if (!this.variation || this.variation.id === 0) {
      this.variation = new Variation();
      this.variation.schedule.setScheduleDays(7);
      this.startDate = undefined;
      this.schedule = new Schedule(this.variation.schedule);
      this.setVariation();
    }
  }
  get employee(): Employee {
    return this._employee;
  }
  private _site: Site = new Site();
  @Input()
  public set site(iSite: ISite) {
    this._site = new Site(iSite);
  }
  get site(): Site {
    return this._site;
  }
  @Output() changed = new EventEmitter<Employee>();

  variations: Variation[] = [];
  variation: Variation;
  schedule: Schedule;
  variationForm: FormGroup;
  startDate: Date | undefined;
  endDate: Date | undefined;

  constructor(
    protected authService: AuthService,
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected dialogService: DialogService,
    private fb: FormBuilder,
    protected dialog: MatDialog
  ) {
    this.variation = new Variation();
    this.variation.schedule.setScheduleDays(7);
    this.schedule = new Schedule(this.variation.schedule);
    this.variationForm = this.fb.group({
      variation: '0',
      start: [new Date(), [Validators.required]],
      end: [new Date(), [Validators.required]],
      mids: false,
      dates: false,
    });
    const iSite = this.siteService.getSite();
    if (iSite) {
      this.site = iSite;
    }
  }

  setVariationLists() {
    const now = new Date();
    const site = this.siteService.getSite();
    let siteid = '';
    if (site) {
      siteid = site.id;
    }
    this.variations = [];
    let count = 0;
    this.employee.variations.forEach(v => {
      const vari = new Variation(v);
      if (vari.enddate.getTime() >= now.getTime() 
        && vari.site.toLowerCase() === siteid.toLowerCase()) {
        this.variations.push(vari)
      }
    });
    this.variations.sort((a,b) => a.compareTo(b));
  }

  dateString(date: Date): string {
    const months: string[] = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
    return `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;
  }

  getLabel(vari: Variation) {
    let answer = '';
    if (vari.mids) {
      answer += '(MIDS) ';
    } else {
      answer += '(OTHER) ';
    }
    answer += `${this.dateString(vari.startdate)}-${this.dateString(vari.enddate)}`;
    return answer;
  }

  selectVariation() {
    const variID = Number(this.variationForm.value.variation);
    if (variID > 0) {
      this.employee.variations.forEach(vari => {
        if (vari.id === variID) {
          this.variation = new Variation(vari);
          this.schedule = new Schedule(this.variation.schedule);
          this.setVariation();
        }
      });
    } else {
      this.variation = new Variation();
      this.variation.schedule.setScheduleDays(7);
      this.schedule = new Schedule(this.variation.schedule);
      this.setVariation();
    }
  }

  setVariation() {
    this.variationForm.controls['start'].setValue(this.variation.startdate);
    this.variationForm.controls['end'].setValue(this.variation.enddate);
    this.variationForm.controls['mids'].setValue(this.variation.mids);
    this.variationForm.controls['dates'].setValue(
      this.variation.schedule.showdates);
    if (this.variation.schedule.showdates) {
      this.startDate = new Date(this.variation.startdate);
      this.endDate = new Date(this.variation.enddate);
    } else {
      this.startDate = undefined;
      this.endDate = undefined;
    }
    this.schedule = new Schedule(this.variation.schedule);
  }

  setVariationEnd() {
    const sDate = new Date(this.variationForm.value.start);
    const eDate = new Date(this.variation.enddate);
    if (eDate.getTime() < sDate.getTime()) {
      this.variationForm.controls['end'].setValue(sDate);
    }
  }
  
  updateSchedule(data: string) {
    if (typeof(data) === 'string') {
      const chgParts = data.split("|");
      let bWorkdays = false;
      let variationID = this.variation.id;

      if (this.variation.id > 0) {
        const change: ChangeAssignmentRequest = {
          employee: this.employee.id,
          asgmt: this.variation.id,
          schedule: 0,
          field: chgParts[3],
          value: chgParts[4],
        }
        this.dialogService.showSpinner();
        if (chgParts[0].toLowerCase() === 'schedule') {
          this.authService.statusMessage = `Updating Employee Variation -`
            + `Schedule Days`;
        } else {
          bWorkdays = true;
          change.workday = Number(chgParts[2]);
          this.authService.statusMessage = `Updating Employee Variation -`
            + `Schedule Workday`;
        }
        this.empService.updateVariation(change, bWorkdays)
          .subscribe({
            next: (data: EmployeeResponse) => {
              this.dialogService.closeSpinner();
              if (data && data !== null) {
                if (data.employee) {
                  this.employee = new Employee(data.employee);
                  this.employee.variations.forEach(agmt => {
                    if (agmt.id === variationID) {
                      this.variation = new Variation(agmt);
                      this.setVariation();
                    }
                  });
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
        // a new variation which will be added in its entirity.
        if (chgParts[0].toLowerCase() === 'schedule') {
          // the only schedule action available is to increase or decrease the
          // number of days in the variation's schedule
          this.variation.schedule.setScheduleDays(Number(chgParts[4]));
        } else {
          // this indicates a change in a workday value.  
          const day = Number(chgParts[2]);
          this.variation.schedule.workdays.forEach(wd => {
            if (wd.id === day) {
              switch (chgParts[3].toLowerCase()) {
                case "code":
                  wd.code = chgParts[4];
                  break;
                case "workcenter":
                  wd.workcenter = chgParts[4];
                  break;
                case "hours":
                  wd.hours = Number(chgParts[4]);
                  break;
              }
            }
          });
        }
      } 
    }
  } 

  addVariation() {
    const site = this.siteService.getSite();
    if (site) {
      this.variation.site = site.id;
      this.variation.id = 0;
      this.variation.mids = this.variationForm.value.mids;
      let sDate = new Date(this.variationForm.value.start);
      let eDate = new Date(this.variationForm.value.end);
      this.variation.startdate = sDate;
      this.variation.enddate = eDate;
      this.variation.schedule.showdates = this.variationForm.value.dates;
      this.authService.statusMessage = "Adding New Variation";
      this.dialogService.showSpinner();
      this.empService.addVariation(this.employee.id, this.variation)
        .subscribe({
          next: (data: EmployeeResponse) => {
            this.dialogService.closeSpinner();
            if (data && data !== null) {
              if (data.employee) {
                this._employee = new Employee(data.employee);
                this.setVariationLists();
                let max = 0;
                this.employee.variations.forEach(v => {
                  if (v.id > max) {
                    max = v.id;
                  }
                });
                this.variationForm.controls['variation'].setValue(max);
                this.selectVariation();
              }
              const emp = this.empService.getEmployee();
              if (data.employee && emp && emp.id === data.employee.id) {
                this.empService.setEmployee(data.employee);
              }
            }
            this.changed.emit(new Employee(this.employee));
            this.authService.statusMessage = "Add complete";
          },
          error: (err: EmployeeResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
    }
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

  updateVariation(field: string) {
    if (field.toLowerCase() === 'start') {
      this.setVariationEnd();
    }
    let variationID = this.variation.id;

    if (this.variation.id > 0) {
      let empID = '';
      const data: ChangeAssignmentRequest = {
        employee: this.employee.id,
        asgmt: this.variation.id,
        field: field,
        value: '',
      };
      switch (field.toLowerCase()) {
        case "start":
          data.value = this.getYearFirstDate(new Date(this.variationForm.value.start));
          break;
        case "end":
          data.value = this.getYearFirstDate(new Date(this.variationForm.value.end));
          break;
        case "mids":
          data.value = (this.variationForm.value.mids) ? 'true' : 'false';
          break;
        case "dates":
          data.value = (this.variationForm.value.dates) ? 'true' : 'false';
          break;
      }
      this.authService.statusMessage = "Updating Variation";
      this.dialogService.showSpinner();
      this.empService.updateVariation(data, false)
        .subscribe({
          next: (data: EmployeeResponse) => {
            this.dialogService.closeSpinner();
            if (data && data !== null) {
              if (data.employee) {
                this.employee = new Employee(data.employee);
                let max = 0;
                this.employee.variations.forEach(v => {
                  if (v.id === variationID) {
                    this.variation = new Variation(v);
                  }
                });
                this.setVariation();
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
    } else if (field.toLowerCase() === 'mids') {
      for (let i=1; i < 6; i++) {
        this.variation.schedule.workdays[i].code = 'M';
        this.variation.schedule.workdays[i].hours = 8.0;
      }
      this.schedule = new Schedule(this.variation.schedule);
    } else if (field.toLowerCase() === 'dates') {
      if (this.variationForm.value.dates) {
        let start = new Date(this.variationForm.value.start);
        while (start.getDay() !== 0) {
          start = new Date(start.getTime() - (24 * 3600000));
        }
        let end = new Date(this.variationForm.value.end);
        while (end.getDay() !== 6) {
          end = new Date(end.getTime() + (24 * 3600000));
        }
        const days = Math.floor((end.getTime() - start.getTime()) / (24 * 3600000)) + 1;
        this.variation.schedule.setScheduleDays(days);
        this.schedule = new Schedule(this.variation.schedule);
      }
    }
  }

  deleteVariation() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Variation Deletion', 
      message: 'Are you sure you want to delete this variation?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.dialogService.showSpinner();
        this.authService.statusMessage = "Deleting Employee Variation";
        this.empService.deleteVariation(this.employee.id, this.variation.id)
          .subscribe({
            next: (data: EmployeeResponse) => {
              this.dialogService.closeSpinner();
              if (data && data !== null) {
                if (data.employee) {
                  this.employee = new Employee(data.employee);
                  this.employee.variations.sort((a,b) => a.compareTo(b));
                  this.variationForm.controls["variation"].setValue('0');
                  this.variation = new Variation();
                  this.variation.startdate = new Date();
                  this.variation.enddate = new Date();
                  this.startDate = undefined;
                  this.variation.mids = false;
                  this.variation.schedule.showdates = false;
                  this.variation.schedule.setScheduleDays(7);
                  this.setVariation();
                }
                const emp = this.empService.getEmployee();
                if (data.employee && emp && emp.id === data.employee.id) {
                  this.empService.setEmployee(data.employee);
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
}
