import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-pto-holiday-below-dialog',
  templateUrl: './pto-holiday-below-dialog.component.html',
  styleUrls: ['./pto-holiday-below-dialog.component.scss']
})
export class PtoHolidayBelowDialogComponent {
  showPTO: boolean = true;
  showHolidays: boolean = false;
  ptoPercent: number = 0;
  holidayPercent: number = 0;
  constructor(
    public dialogRef: MatDialogRef<PtoHolidayBelowDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PtoHolidayDialogData,
  ) {
    if (data.totalHoliday > 0.0) {
      this.holidayPercent = (data.holidayHours / data.totalHoliday) * 100.0;
      this.showHolidays = (this.holidayPercent < 80.0);
    }
    if (data.totalPTO > 0.0) {
      this.ptoPercent = (data.ptoHours / data.totalPTO) * 100.0;
      this.showPTO = (this.ptoPercent < 80.0);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

export interface PtoHolidayDialogData {
  ptoHours: number;
  holidayHours: number;
  totalPTO: number;
  totalHoliday: number;
}
