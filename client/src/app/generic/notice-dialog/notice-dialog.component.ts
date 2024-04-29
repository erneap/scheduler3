import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DeletionMessage } from '../deletion-confirmation/deletion-confirmation.component';

@Component({
  selector: 'app-notice-dialog',
  templateUrl: './notice-dialog.component.html',
  styleUrls: ['./notice-dialog.component.scss']
})
export class NoticeDialogComponent {
  yes: string = 'yes';
  no: string = 'no';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DeletionMessage
  ) {}
}
