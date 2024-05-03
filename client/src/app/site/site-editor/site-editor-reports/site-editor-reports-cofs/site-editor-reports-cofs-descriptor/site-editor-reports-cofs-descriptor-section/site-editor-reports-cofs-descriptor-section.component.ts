import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { CofSReport, CofSSection, ICofSReport } from 'src/app/models/sites/cofsreport';
import { ISite, Site } from 'src/app/models/sites/site';
import { Company } from 'src/app/models/teams/company';
import { ITeam, Team } from 'src/app/models/teams/team';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-editor-reports-cofs-descriptor-section',
  templateUrl: './site-editor-reports-cofs-descriptor-section.component.html',
  styleUrls: ['./site-editor-reports-cofs-descriptor-section.component.scss']
})
export class SiteEditorReportsCofsDescriptorSectionComponent {
  private _site: Site = new Site();
  @Input()
  public set site(s: ISite) {
    this._site = new Site(s);
  }
  get site(): Site {
    return this._site;
  }
  private _report: CofSReport = new CofSReport();
  @Input()
  public set report(r: ICofSReport) {
    this._report = new CofSReport(r);
  }
  get report(): CofSReport {
    return this._report;
  }
  private _team: Team = new Team();
  @Input()
  public set team(t: ITeam) {
    this._team = new Team(t);
  }
  get team(): Team {
    return this._team;
  }
  @Input() width: number = 350;
  sections: ListItem[] = [];
  laborcodes: ListItem[] = [];
  companylist: Company[] = [];
  selected: CofSSection;
  sectionForm: FormGroup;

  constructor(
    protected authService: AuthService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.selected = new CofSSection();
    this.selected.id = -1;

    const isite = this.siteService.getSite();
    if (isite) {
      this.site = isite;
    }
    const iteam = this.teamService.getTeam();
    if (iteam) {
      this.team = iteam;
    }

    this.sectionForm = this.fb.group({
      company: ['', [Validators.required]],
      label: ['', [Validators.required]],
      signature: ['', [Validators.required]],
      showunit: false,
      laborcodes: [],
    });
  }

  setSections() {
    this.sections = [];
    this.sections.push(new ListItem('-1', 'Add New Section'));
    if (this.report.sections) {
      this.report.sections.forEach(sect => {
        this.sections.push(new ListItem(`${sect.id}`, sect.label))
      });
    }
  }

  setLaborCodes() {
    
  }
}
