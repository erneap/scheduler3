import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-password-expire-dialog',
  templateUrl: './password-expire-dialog.component.html',
  styleUrls: ['./password-expire-dialog.component.scss']
})
export class PasswordExpireDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PasswordExpireDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

export interface DialogData {
  days: number;
}
