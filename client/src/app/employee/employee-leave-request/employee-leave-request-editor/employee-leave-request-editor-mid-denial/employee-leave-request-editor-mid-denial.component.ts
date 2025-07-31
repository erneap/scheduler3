import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-employee-leave-request-editor-mid-denial',
    templateUrl: './employee-leave-request-editor-mid-denial.component.html',
    styleUrls: ['./employee-leave-request-editor-mid-denial.component.scss'],
    standalone: false
})
export class EmployeeLeaveRequestEditorMidDenialComponent {
  constructor(
    public dialogRef: MatDialogRef<EmployeeLeaveRequestEditorMidDenialComponent>
  ) { }
}
