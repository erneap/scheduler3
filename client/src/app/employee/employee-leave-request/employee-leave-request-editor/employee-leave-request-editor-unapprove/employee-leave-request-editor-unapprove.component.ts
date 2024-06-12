import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-employee-leave-request-editor-unapprove',
  templateUrl: './employee-leave-request-editor-unapprove.component.html',
  styleUrls: ['./employee-leave-request-editor-unapprove.component.scss']
})
export class EmployeeLeaveRequestEditorUnapproveComponent {
  commentForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EmployeeLeaveRequestEditorUnapproveComponent>,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      comment: '',
    });
  }
}
