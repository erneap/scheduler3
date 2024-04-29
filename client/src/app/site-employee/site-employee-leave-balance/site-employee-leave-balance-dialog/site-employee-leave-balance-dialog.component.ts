import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-site-employee-leave-balance-dialog',
  templateUrl: './site-employee-leave-balance-dialog.component.html',
  styleUrls: ['./site-employee-leave-balance-dialog.component.scss']
})
export class SiteEmployeeLeaveBalanceDialogComponent {
  balanceForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<SiteEmployeeLeaveBalanceDialogComponent>,
    private fb: FormBuilder
  ) {
    const now = new Date();
    this.balanceForm = this.fb.group({
      year: [now.getFullYear(), [Validators.required]],
    });
  }

  onCancel() {
    this.dialogRef.close('');
  }

  onOk() {
    this.dialogRef.close(`${this.balanceForm.value.year}`);
  }
}
