import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { Employee } from 'src/app/models/employees/employee';
import { ILeaveDay, LeaveDay } from 'src/app/models/employees/leave';
import { Workcode } from 'src/app/models/teams/workcode';
import { EmployeeResponse } from 'src/app/models/web/employeeWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-employees-leave-row',
  templateUrl: './site-employees-leave-row.component.html',
  styleUrls: ['./site-employees-leave-row.component.scss']
})
export class SiteEmployeesLeaveRowComponent {
  private _leave: LeaveDay = new LeaveDay();
  @Input()
  public set leaveday(lv: ILeaveDay) {
    this._leave = new LeaveDay(lv);
    this.setForm();
    this.showInput = (this._leave.status.toLowerCase() !== 'actual');
  }
  get leaveday(): LeaveDay {
    return this._leave;
  }
  @Input() employee: Employee = new Employee();
  @Output() changed = new EventEmitter<Employee>();
  leaveForm: FormGroup;
  leaveCodes: Workcode[];
  showInput: boolean = true;

  constructor(
    protected authService: AuthService,
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    protected dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.leaveCodes = [];
    const team = this.teamService.getTeam();
    if (team) {
      team.workcodes.forEach(wc => {
        if (wc.isLeave) {
          this.leaveCodes.push(new Workcode(wc));
        }
      })
    }
    this.leaveForm = this.fb.group({
      date: [this.dateString(new Date()), [Validators.required, 
        Validators.pattern('^[0-9]{2}/[0-9]{2}/[0-9]{4}$')]],
      code: ['', [Validators.required]],
      hours: ['', [Validators.required]],
      status: ['approved', [Validators.required]],
    })
  }

  setForm() {
    this.leaveForm.controls['date'].setValue(this.dateString(new Date(
      this.leaveday.leavedate)));
    this.leaveForm.controls['code'].setValue(this.leaveday.code);
    this.leaveForm.controls['hours'].setValue(this.leaveday.hours.toFixed(1));
    this.leaveForm.controls['status'].setValue(this.leaveday.status);
  }

  getRowStyle(): string {
    let answer = '';
    if (!this.showInput) {
      this.leaveCodes.forEach(lc => {
        if (this.leaveday.code.toLowerCase() === lc.id.toLowerCase()) {
          answer = `background-color: #FFD9B3;color: #${lc.backcolor}`;
        }
      });
    } else {
      this.leaveCodes.forEach(lc => {
        if (this.leaveday.code.toLowerCase() === lc.id.toLowerCase()) {
          answer = `background-color: #${lc.backcolor};color: #${lc.textcolor}`;
        }
      });
    }
    return answer;
  }

  getInputStyle(): string {
    let answer = 'background-color: transparent;';
    if (!this.showInput) {
      this.leaveCodes.forEach(lc => {
        if (this.leaveday.code.toLowerCase() === lc.id.toLowerCase()) {
          answer += `color: #${lc.backcolor}`;
        }
      });
    } else {
      this.leaveCodes.forEach(lc => {
        if (this.leaveday.code.toLowerCase() === lc.id.toLowerCase()) {
          answer += `color: #${lc.textcolor}`;
        }
      });
    }
    return answer;
  }
  
  dateString(date: Date): string {
    let answer = '';
    if (date.getMonth() < 9) {
      answer += '0';
    }
    answer += `${date.getMonth() + 1}/`;
    if (date.getDate() < 10) {
      answer += '0';
    }
    answer += `${date.getDate()}/${date.getFullYear()}`;
    return answer;
  }

  codeText(): string {
    let answer = '';
    this.leaveCodes.forEach(lc => {
      if (this.leaveday.code.toLowerCase() === lc.id.toLowerCase()) {
        answer = lc.title;
      }
    });
    return answer;
  }

  updateLeave(field: string) {
    let value = '';
    let valid = false;
    switch (field.toLowerCase()) {
      case "date":
        value = this.leaveForm.value.date;
        let dateregexp = new RegExp('^[0-9]{2}/[0-9]{2}/[0-9]{4}$');
        valid = dateregexp.test(value);
        if (!valid) {
          this.authService.statusMessage = 'Date must be in MM/DD/YYYY format';
        }
        break;
      case "code":
        value = this.leaveForm.value.code;
        this.leaveCodes.forEach(lc => {
          if (lc.id.toLowerCase() === value.toLowerCase()) {
            valid = true;
          }
        });
        if (!valid) {
          this.authService.statusMessage = "Select a good leave type";
        }
        break;
      case "hours":
        value = this.leaveForm.value.hours;
        const hoursregexp = /^\d{1,2}(\.\d{1})?$/;
        valid = hoursregexp.test(value);
        if (!valid) {
          this.authService.statusMessage = "Leave hours must be a decimal number";
        }
        break;
      case "status":
        value = this.leaveForm.value.status;
        valid = true;
    }
    if (valid) {
      this.empService.updateLeave(this.employee.id, this.leaveday.id, field,
        value).subscribe({
        next: (data: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null && data.employee) {
            this.changed.emit(new Employee(data.employee));
          }
        },
        error: (err: EmployeeResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
  }
  
  deleteLeave() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Leave Deletion', 
      message: 'Are you sure you want to delete this leave?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.dialogService.showSpinner();
        this.authService.statusMessage = "Deleting Employee Leave";
        this.empService.deleteLeave(this.employee.id, this.leaveday.id)
          .subscribe({
            next: (data: EmployeeResponse) => {
              this.dialogService.closeSpinner();
              if (data && data !== null && data.employee) {
                this.changed.emit(new Employee(data.employee));
              }
            },
            error: (err: EmployeeResponse) => {
              this.dialogService.closeSpinner();
              this.authService.statusMessage = err.exception;
            }
          });
        
      }
    });
  }
}

