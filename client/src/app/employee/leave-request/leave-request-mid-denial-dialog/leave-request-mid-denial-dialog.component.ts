import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-leave-request-mid-denial-dialog',
  templateUrl: './leave-request-mid-denial-dialog.component.html',
  styleUrls: ['./leave-request-mid-denial-dialog.component.scss']
})
export class LeaveRequestMidDenialDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LeaveRequestMidDenialDialogComponent>
  ) {}
}
