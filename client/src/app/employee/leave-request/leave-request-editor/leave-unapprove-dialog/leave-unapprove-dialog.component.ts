import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-leave-unapprove-dialog',
  templateUrl: './leave-unapprove-dialog.component.html',
  styleUrls: ['./leave-unapprove-dialog.component.scss']
})
export class LeaveUnapproveDialogComponent {
  commentForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<LeaveUnapproveDialogComponent>,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      comment: '',
    });
  }
}
