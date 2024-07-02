import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-site-employees-leave-balance-dialog',
  templateUrl: './site-employees-leave-balance-dialog.component.html',
  styleUrls: ['./site-employees-leave-balance-dialog.component.scss']
})
export class SiteEmployeesLeaveBalanceDialogComponent {
  balanceForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<SiteEmployeesLeaveBalanceDialogComponent>,
    private fb: FormBuilder
  ) {
    const now = new Date();
    this.balanceForm = this.fb.group({
      year: [now.getUTCFullYear(), [Validators.required]],
    });
  }

  onCancel() {
    this.dialogRef.close('');
  }

  onOk() {
    this.dialogRef.close(`${this.balanceForm.value.year}`);
  }
}
