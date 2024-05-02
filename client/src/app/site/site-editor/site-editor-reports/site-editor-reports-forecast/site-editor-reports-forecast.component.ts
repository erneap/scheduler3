import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { ForecastReport } from 'src/app/models/sites/forecastreport';
import { ISite, Site } from 'src/app/models/sites/site';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-editor-reports-forecast',
  templateUrl: './site-editor-reports-forecast.component.html',
  styleUrls: ['./site-editor-reports-forecast.component.scss']
})
export class SiteEditorReportsForecastComponent {
  private _site: Site = new Site();
  @Input()
  public set site(s: ISite) {
    this._site = new Site(s);
  }
  get site(): Site {
    return this._site;
  }
  @Input() teamid: string = '';
  @Input() width: number = 790;
  @Output() changed = new EventEmitter<Site>();
  reports: ListItem[] = [];
  selected: ForecastReport;
  reportForm: FormGroup;

  constructor(
    protected authService: AuthService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.selected = new ForecastReport();
    this.selected.id = -1;
    const isite = this.siteService.getSite();
    if (isite) {
      this.site = isite;
    }
    const iteam = this.teamService.getTeam();
    this.reportForm = this.fb.group({
      name: ['', [Validators.required]],
      start: [new Date(), [Validators.required]],
      end: [new Date(), [Validators.required]],
      period: ["0", [Validators.required]],
      companyid: ["", [Validators.required]]
    })
  }
}
