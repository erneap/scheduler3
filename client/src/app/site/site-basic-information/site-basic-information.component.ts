import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ISite, Site } from 'src/app/models/sites/site';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AppStateService } from 'src/app/services/app-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-basic-information',
  templateUrl: './site-basic-information.component.html',
  styleUrls: ['./site-basic-information.component.scss']
})
export class SiteBasicInformationComponent {
  private _site?: Site;
  @Input()
  public set site(iSite: ISite) {
    this._site = new Site(iSite);
    this.setSite();
  }
  get site(): Site {
    if (!this._site) {
      const tSite = this.siteService.getSite();
      if (tSite) {
        this.site = new Site(tSite);
        this.setSite();
      } else {
        this.site = new Site();
        this.setSite();
      }
    }
    if (this._site) {
      return this._site;
    }
    return new Site();
  }
  @Output() siteChanged = new EventEmitter<Site>();
  teamid: string;
  siteForm: FormGroup
  midsValues: string[] = new Array('yes', 'no');

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected stateService: AppStateService,
    private fb: FormBuilder
  ) {
    const team = this.teamService.getTeam();
    if (team) {
      this.teamid = team.id
    } else {
      this.teamid = '';
    }
    this.siteForm = this.fb.group({
      name: ['', [Validators.required]],
      mids: ['yes'],
      offset: [0, [Validators.required, Validators.min(-12.0), Validators.max(12.0)]],
    });
  }

  setSite() {
    this.siteForm.controls['name'].setValue(this.site.name);
    this.siteForm.controls['offset'].setValue(this.site.utcOffset);
    if (this.site.showMids) {
      this.siteForm.controls['mids'].setValue('no');
    } else {
      this.siteForm.controls['mids'].setValue('yes');
    }
  }

  onChange() {
    if (this.siteForm.valid) {
      this.authService.statusMessage = "Updating Site Information";
      this.dialogService.showSpinner();
    }
  }
}
