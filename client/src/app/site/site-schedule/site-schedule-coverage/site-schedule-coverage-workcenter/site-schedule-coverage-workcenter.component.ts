import { Component, Input } from '@angular/core';
import { ISite, Site } from 'src/app/models/sites/site';
import { IWorkcenter, Workcenter } from 'src/app/models/sites/workcenter';
import { AppStateService } from 'src/app/services/app-state.service';

@Component({
  selector: 'app-site-schedule-coverage-workcenter',
  templateUrl: './site-schedule-coverage-workcenter.component.html',
  styleUrls: ['./site-schedule-coverage-workcenter.component.scss']
})
export class SiteScheduleCoverageWorkcenterComponent {
  private _site: Site = new Site();
  @Input()
  public set site(isite: ISite) {
    this._site = new Site(isite);
  }
  get site(): Site {
    return this._site;
  }
  private _workcenter: Workcenter = new Workcenter();
  @Input()
  public set workcenter(iWc: IWorkcenter) {
    this._workcenter = new Workcenter(iWc);
  }
  get workcenter(): Workcenter {
    return this._workcenter;
  }
  private _month: Date = new Date();
  @Input()
  public set month(dt: Date) {
    this._month = new Date(dt);
    this.setMonth();
  }
  get month(): Date {
    return this._month;
  }
  
  monthDays: Date[] = [];
  count: number = -2;
  width: number = 25;

  constructor(
    protected appState: AppStateService
  ) {}

  setMonth() {
    this.monthDays = [];
    let start = new Date(Date.UTC(this.month.getUTCFullYear(), 
      this.month.getUTCMonth(), 1));
    const end = new Date(Date.UTC(this.month.getUTCFullYear(), 
      this.month.getUTCMonth() + 1, 1));
    while (start.getTime() < end.getTime()) {
      this.monthDays.push(new Date(start));
      start = new Date(start.getTime() + (24 * 3600000));
    }
  }

  nameWidth(): number {
    let width = (this.appState.viewWidth > 1089) ? 1089 
      : this.appState.viewWidth - 44; 
    const ratio = width / 1089;
    width = Math.floor(250 * ratio)
    if (width < 150) {
      width = 150;
    }
    this.width = Math.floor(25 * ratio);
    if (this.width < 15) {
      this.width = 15;
    }
    return width;
  }

  nameStyle(): string {
    return `width: ${this.nameWidth()}px;`
  }

  nameCellStyle(even: number): string {
    let width = (this.appState.viewWidth > 1089) ? 1089 
      : this.appState.viewWidth - 44; 
    const ratio = width / 1089;
    let fontSize = Math.floor(12 * ratio);
    if (fontSize < 9) fontSize = 9;
    if (even < 0) {
      return `background-color: black;color: white;font-size: ${fontSize}pt;`
        + `width: ${this.nameWidth()}px;height: ${this.width}px;`;
    } else if (even % 2 === 0) {
      return `background-color: #c0c0c0;color: black;font-size: ${fontSize}pt;`
        + `width: ${this.nameWidth()}px;height: ${this.width}px;`;
    } else {
      return `background-color: white;color: black;font-size: ${fontSize}pt;`
        + `width: ${this.nameWidth()}px;height: ${this.width}px;`;
    }
  }

  daysStyle(): string {
    let width = (this.appState.viewWidth > 1089) ? 1089 
      : this.appState.viewWidth; 
    width -= (this.nameWidth() + 2); 
    return `width: ${width}px;`;
  }
}
