import { Component, Input } from '@angular/core';
import { IWorkcode, Workcode } from 'src/app/models/teams/workcode';

@Component({
  selector: 'app-site-ingest-month-legend',
  templateUrl: './site-ingest-month-legend.component.html',
  styleUrls: ['./site-ingest-month-legend.component.scss']
})
export class SiteIngestMonthLegendComponent {
  private _month: Date = new Date();
  private _leavecodes: Workcode[] = [];
  @Input()
  public set month(dt: Date) {
    this._month = new Date(dt);
    this.setPerRow();
  }
  get month(): Date {
    return this._month;
  }
  @Input()
  public set leavecodes(codes: IWorkcode[]) {
    this._leavecodes = [];
    codes.forEach(code => {
      this._leavecodes.push(new Workcode(code));
    });
    this.setPerRow();
  }
  get leavecodes(): Workcode[] {
    return this._leavecodes;
  }
  codesPerRow: number = 6;
  rows: Workcode[][] = [];

  setPerRow() {
    let dates: Date[] = [];
    let start = new Date(Date.UTC(this.month.getUTCFullYear(), 
      this.month.getUTCMonth(), 1));
    while (start.getUTCMonth() === this.month.getUTCMonth()) {
      dates.push(start);
      start = new Date(start.getTime() + (24 * 3600000));
    }

    const totalwidth = (dates.length * 37) + 202 + 102;
    this.codesPerRow = Math.floor(totalwidth / 302);

    let count = 0;
    this.rows = [];
    let row: Workcode[] | undefined = undefined;
    this._leavecodes.forEach(wc => {
      if (count % this.codesPerRow === 0 || !row) {
        row = new Array<Workcode>();
        this.rows.push(row);
      }
      row.push(new Workcode(wc));
      count++;
    });
  }
}
