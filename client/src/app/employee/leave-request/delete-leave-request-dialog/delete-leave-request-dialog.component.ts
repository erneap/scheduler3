import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-leave-request-dialog',
  templateUrl: './delete-leave-request-dialog.component.html',
  styleUrls: ['./delete-leave-request-dialog.component.scss']
})
export class DeleteLeaveRequestDialogComponent {
  yes: string = 'yes';
  no: string = 'no';

  constructor(
    public dialogRef: MatDialogRef<DeleteLeaveRequestDialogComponent>,
  ) {}
}
