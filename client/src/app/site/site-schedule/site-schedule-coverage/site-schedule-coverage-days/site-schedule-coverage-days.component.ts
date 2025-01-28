import { Component, Input } from '@angular/core';
import { ISite, Site } from 'src/app/models/sites/site';

@Component({
  selector: 'app-site-schedule-coverage-days',
  templateUrl: './site-schedule-coverage-days.component.html',
  styleUrls: ['./site-schedule-coverage-days.component.scss']
})
export class SiteScheduleCoverageDaysComponent {
  private _site: Site = new Site();
  @Input()
  public set site(s: ISite) {
    this._site = new Site(s);
  }
  get site(): Site {
    return this._site;
  }
  private _dates: Date[] = [];
  @Input()
  public set dates(dt: Date[]) {
    this._dates = [];
    dt.forEach(d => {
      this._dates.push(new Date(d));
    })
  }
  get dates(): Date[] {
    return this._dates
  }
  @Input() wkctrID: string = '';
  @Input() shiftID: string = '';
  @Input() viewtype: string = 'label';
  private _width: number = 25;
  @Input() 
  public set width(w: number) {
    this._width = w;
  }
  get width(): number {
    return this._width;
  }
}
