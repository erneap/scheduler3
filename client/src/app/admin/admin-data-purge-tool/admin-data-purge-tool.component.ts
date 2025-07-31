import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { TeamsResponse } from 'src/app/models/web/teamWeb';
import { AdminService } from 'src/app/services/admin.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';

@Component({
    selector: 'app-admin-data-purge-tool',
    templateUrl: './admin-data-purge-tool.component.html',
    styleUrls: ['./admin-data-purge-tool.component.scss'],
    standalone: false
})
export class AdminDataPurgeToolComponent {
  purgeForm: FormGroup;

  constructor(
    protected adminService: AdminService,
    protected dialogService: DialogService,
    protected authService: AuthService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    let pd = new Date();
    pd = new Date(Date.UTC(pd.getUTCFullYear()-1, 0, 1));
    this.purgeForm = this.fb.group({
      purgedate: [pd, [Validators.required]],
    })
  }

  onPurge() {
    const purgeDate = new Date(this.purgeForm.value.purgedate);
    let pd = new Date();
    pd = new Date(Date.UTC(pd.getUTCFullYear()-1, 0, 1));
    if (purgeDate.getTime() <= pd.getTime()) {
      const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
        data: {title: 'Confirm Data Purge',
        message:  'Are you sure you want to purge old information?'},
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'yes') {
          this.dialogService.showSpinner();
          this.adminService.purgeData(purgeDate).subscribe({
            next: (data: TeamsResponse) => {
              // nothing done with data.
            },
            error: (err: TeamsResponse) => {
              this.dialogService.closeSpinner();
              this.authService.statusMessage = err.exception;
            }
          });
        }
      });
    }
  }
}
