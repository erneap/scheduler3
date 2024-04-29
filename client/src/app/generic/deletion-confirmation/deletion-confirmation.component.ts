import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DeletionMessage {
  title: string;
  message: string;
}

@Component({
  selector: 'app-deletion-confirmation',
  templateUrl: './deletion-confirmation.component.html',
  styleUrls: ['./deletion-confirmation.component.scss']
})
export class DeletionConfirmationComponent {
  yes: string = 'yes';
  no: string = 'no';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DeletionMessage
  ) {}
}
