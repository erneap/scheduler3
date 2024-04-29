import { Component, Input } from '@angular/core';
import { IWorkcode, Workcode } from 'src/app/models/teams/workcode';
import { AppStateService } from 'src/app/services/app-state.service';

@Component({
  selector: 'app-site-schedule-legend-code',
  templateUrl: './site-schedule-legend-code.component.html',
  styleUrls: ['./site-schedule-legend-code.component.scss']
})
export class SiteScheduleLegendCodeComponent {
  private _leavecode: Workcode = new Workcode();
  @Input()
  public set leavecode(lc: IWorkcode) {
    this._leavecode = new Workcode(lc);
    this.setLeaveCode();
  }
  get leavecode(): Workcode {
    return this._leavecode;
  }

  divStyle: string = '';

  constructor(
    protected appState: AppStateService
  ) {}

  setLeaveCode() {
    let width = 1089;
    if (this.appState.viewWidth < 1089) {
      width = this.appState.viewWidth
    }
    const ratio = width / 1089;
    let fontsize = Math.floor(12 * ratio);
    if (fontsize < 9) {
      fontsize = 9;
    }
    let cWidth = Math.floor(width / 5);
    if (cWidth < 150) {
      cWidth = 150;
    }
    this.divStyle = `background-color: #${this.leavecode.backcolor};`
      + `color: #${this.leavecode.textcolor};`
      + `border: solid 1px #${this.leavecode.textcolor};`
      + `font-size: ${fontsize}pt; width: ${cWidth}px;`;
  }
}
