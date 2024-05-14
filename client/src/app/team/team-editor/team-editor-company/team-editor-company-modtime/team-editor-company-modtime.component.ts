import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { Company, ICompany, ModPeriod } from 'src/app/models/teams/company';
import { ITeam, Team } from 'src/app/models/teams/team';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-editor-company-modtime',
  templateUrl: './team-editor-company-modtime.component.html',
  styleUrls: ['./team-editor-company-modtime.component.scss']
})
export class TeamEditorCompanyModtimeComponent {
  private _team: Team = new Team();
  @Input()
  public set team(t: ITeam) {
    this._team = new Team(t);
  }
  get team(): Team {
    return this._team;
  }
  private _company: Company = new Company();
  @Input()
  public set company(c: ICompany) {
    this._company = new Company(c);
    this.setModPeriods();
  }
  get company(): Company {
    return this._company;
  }
  @Input() width: number = 250;
  modtimes: ListItem[] = [];
  selected: ModPeriod = new ModPeriod();
  modForm: FormGroup;

  constructor(
    protected authService: AuthService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    const now = new Date();
    this.modForm = this.fb.group({
      year: [now.getFullYear(), [Validators.required]],
      start: [now, [Validators.required]],
      end: [now, [Validators.required]],
    });
    this.setModPeriods();
  }

  setModPeriods() {
    this.modtimes = [];
    this.modtimes.push(new ListItem('', 'Add New Mod Period'));
    if (this.company.modperiods) {
      this.company.modperiods.forEach(mp => {
        const label = `${mp.year}`;
        this.modtimes.push(new ListItem(label, label));
      });
    }
  }
}
