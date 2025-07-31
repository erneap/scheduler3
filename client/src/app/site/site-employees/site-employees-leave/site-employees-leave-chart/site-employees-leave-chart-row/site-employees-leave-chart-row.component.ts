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

@Component({
    selector: 'app-site-employees-leave-chart-row',
    templateUrl: './site-employees-leave-chart-row.component.html',
    styleUrl: './site-employees-leave-chart-row.component.scss',
    standalone: false
})
export class SiteEmployeesLeaveChartRowComponent {
  private _leave: LeaveDay | undefined;
  @Input()
  public set leave(l: ILeaveDay) {
    this._leave = new LeaveDay(l);
    this.setLeave();
  }
  get leave(): LeaveDay | undefined {
    return this._leave;
  }
  @Input() employee: Employee = new Employee();
  @Input() width: number = 615;
  @Input() leavecodes: Workcode[] = [];
  @Output() changed = new EventEmitter<Employee>();
  leaveForm: FormGroup;

  constructor(
    protected authService: AuthService,
    protected empService: EmployeeService,
    protected dialogService: DialogService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.leaveForm = this.fb.group({
      date: ['', [Validators.required]],
      code: ['', [Validators.required]],
      hours: [0.0, [Validators.required, Validators.min(0.1), Validators.max(12.0)]],
      status: ['REQUESTED', [Validators.required]],
      tagday: '',
    })
  }

  setLeave() {
    if (this.leave) {
      this.leaveForm.controls['date'].setValue(this.dateString(
        new Date(this.leave.leavedate)));
      this.leaveForm.controls['code'].setValue(this.leave.code);
      this.leaveForm.controls['hours'].setValue(this.leave.hours);
      this.leaveForm.controls['status'].setValue(this.leave.status);
      this.leaveForm.controls['tagday'].setValue(this.leave.tagday);
    }
  }

  dateString(dt: Date): string {
    let value = '';
    if (dt.getUTCMonth() < 9) {
      value += '0';
    }
    value += `${dt.getUTCMonth() + 1}/`;
    if (dt.getUTCDate() < 10) {
      value += '0';
    }
    value += `${dt.getUTCDate()}/${dt.getUTCFullYear()}`;
    return value;
  }

  fieldStyle(field: string): string {
    let ratio = this.width / 615;
    if (ratio > 1.0) ratio = 1.0;
    let fontsize = 0.9 * ratio;
    let width = 100;
    let txColor = 'ffffff';
    let bkColor = '673ab7';
    switch (field.toLowerCase()) {
      case "delete":
        width = Math.floor(25 * ratio);
        break;
      case "date":
        width = Math.floor(125 * ratio);
        break;
      case "code":
        width = Math.floor(125 * ratio);
        break;
      case "hours":
        width = Math.floor(100 * ratio);
        break;
      case "status":
        width = Math.floor(215 * ratio);
        break;
      case "tagday":
        width = Math.floor(125 * ratio);
        break;
    }
    if (this.leave) {
      const ccode = this.leaveForm.value.code;
      this.leavecodes.forEach(wc => {
        if (wc.id.toLowerCase() === ccode.toLowerCase()) {
          txColor = wc.textcolor;
          bkColor = wc.backcolor;
        }
      });
    }
    return `width: ${width}px;font-size: ${fontsize}rem;background-color: `
      + `#${bkColor};color: #${txColor};border: solid 1px #${txColor};`;
  }

  onUpdate(field: string) {
    const leaveID = (this.leave) ? this.leave.id : 0;
    let value = '';
    switch (field.toLowerCase()) {
      case "date":
        value += this.leaveForm.value.date;
        break;
      case 'code':
        value = this.leaveForm.value.code;
        break;
      case "hours":
        value = (Number(this.leaveForm.value.hours)).toFixed(1);
        break;
      case "status":
        value = this.leaveForm.value.status;
        break;
      case "tagday":
        value = this.leaveForm.value.tagday;
        break;
    }
    this.dialogService.showSpinner();
    this.empService.updateLeave(this.employee.id, leaveID, field, value)
    .subscribe({
      next: (data: EmployeeResponse) => {
        this.dialogService.closeSpinner();
        if (data && data !== null && data.employee) {
          this.employee = new Employee(data.employee);
          this.employee.leaves.forEach(lv => {
            if (this.leave && lv.id === this.leave.id) {
              this.leave = lv;
            }
          });
          this.changed.emit(this.employee);
        }
      },
      error: (err: EmployeeResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    })
  }

  onDelete() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Leave Deletion', 
      message: 'Are you sure you want to delete this leave?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes' && this.leave) {
        this.dialogService.showSpinner();
        this.empService.deleteLeave(this.employee.id, this.leave.id)
        .subscribe({
          next: (data: EmployeeResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = 'Leave deleted'
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
