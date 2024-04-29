import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ITeam, Team } from '../../models/teams/team';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { Workcode } from 'src/app/models/teams/workcode';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { TeamService } from 'src/app/services/team.service';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';

@Component({
  selector: 'app-team-workcodes',
  templateUrl: './team-workcodes.component.html',
  styleUrls: ['./team-workcodes.component.scss']
})
export class TeamWorkcodesComponent {
  private _team: Team = new Team();
  @Input()
  public set team(iTeam: ITeam) {
    this._team = new Team(iTeam);
    this.setWorkcodes();
  }
  get team(): Team {
    return this._team;
  }
  @Output() teamChanged = new EventEmitter<Team>();
  workcodes: ListItem[] = [];
  selected: string = 'new';
  workcode: Workcode = new Workcode();
  codeForm: FormGroup;
  hours: string[];

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected teamService: TeamService,
    protected dialog: MatDialog,
    private fb: FormBuilder
  ) { 
    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      this.team = iTeam;
      this.setWorkcodes();
    }
    this.codeForm = this.fb.group({
      id: ['', [Validators.required]],
      altcode: '',
      search: '',
      title: ['', [Validators.required]],
      start: '0',
      premimum: '',
      leave: false,
      colors: ['000000-ffffff', [Validators.pattern('^[0-9a-fA-F]{6}\-[0-9a-fA-F]{6}$')]],
    });
    this.hours = [];
    for (let i=1; i <= 24; i++) {
      this.hours.push(`${i}`);
    }
  }

  setWorkcodes() {
    this.workcodes = [];
    this.workcodes.push(new ListItem('new', 'Add new workcode'));
    if (this.team.workcodes) {
      const workcodes = this.team.workcodes.sort((a,b) => a.compareTo(b));
      workcodes.forEach(wc => {
        this.workcodes.push(new ListItem(wc.id, wc.title));
      })
    }
  }
  
  onSelect(id: string) {
    this.selected = id;
    this.setWorkcode();
  }

  setWorkcode() {
    if (this.selected === 'new') {
      this.workcode = new Workcode();
      this.codeForm.controls['id'].setValue('');
      this.codeForm.controls['altcode'].setValue('');
      this.codeForm.controls['search'].setValue('');
      this.codeForm.controls['title'].setValue('');
      this.codeForm.controls['start'].setValue('0');
      this.codeForm.controls['premimum'].setValue('');
      this.codeForm.controls['leave'].setValue(false);
      this.codeForm.controls['colors'].setValue('000000-ffffff');
    } else {
      if (this.team.workcodes) {
        this.team.workcodes.forEach(wc => {
          if (wc.id.toLowerCase() === this.selected.toLowerCase()) {
            this.workcode = new Workcode(wc);
            this.codeForm.controls['id'].setValue(wc.id);
            this.codeForm.controls['altcode'].setValue(wc.altcode);
            this.codeForm.controls['search'].setValue(wc.search);
            this.codeForm.controls['title'].setValue(wc.title);
            this.codeForm.controls['start'].setValue(`${wc.start}`);
            this.codeForm.controls['premimum'].setValue(`${wc.shiftCode}`);
            this.codeForm.controls['leave'].setValue(wc.isLeave);
            const colors = `${wc.textcolor}-${wc.backcolor}`;
            this.codeForm.controls['colors'].setValue(colors);
          }
        });
      }
    }
  }

  getButtonClass(id: string) {
    let answer = 'employee';
    if (this.selected.toLowerCase() === id.toLowerCase()) {
      answer += ' active';
    }
    return answer;
  }

  getCodeClass(id: string): string {
    let answer = '';
    if (this.team.workcodes) {
      this.team.workcodes.forEach(wc => {
        if (wc.id.toLowerCase() === id.toLowerCase()) {
          answer = `background-color: #${wc.backcolor};color: #${wc.textcolor};`;
        }
      });
    }
    return answer;
  }

  getFormColorStyle(): string {
    let answer = 'background-color: #ffffff;color: #000000;';
    if (this.codeForm.controls['colors'].valid) {
      const value: string = this.codeForm.controls['colors'].value
      const colors = value.split('-');
      answer = `background-color: #${colors[1]};`
        + `color: #${colors[0]};`;
    }
    return answer;
  }

  onUpdate(field: string) {
    if (this.selected !== 'new') {
      const value = this.codeForm.controls[field].value;
      this.authService.statusMessage = 'Update Team Workcode';
      this.dialogService.showSpinner();
      this.teamService.updateTeamWorkcode(this.team.id, this.selected, field, 
      value).subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.team) {
            this.team = new Team(data.team);
            this.setWorkcode();
            this.teamService.setTeam(data.team);
            this.teamChanged.emit(new Team(data.team));
          }
          this.authService.statusMessage = "Update complete"
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
  }

  onAdd() {
    this.authService.statusMessage = "Adding team workcode";
    this.dialogService.showSpinner();
    const colors = `${this.codeForm.value.colors}`.split("-");
    this.teamService.addTeamWorkcode(this.team.id, 
      this.codeForm.value.id,
      this.codeForm.value.title,
      Number(this.codeForm.value.start),
      this.codeForm.value.leave,
      this.codeForm.value.premimum,
      colors[0], colors[1], 
      this.codeForm.value.altcode).subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.selected = this.codeForm.value.id;
          if (data && data != null && data.team) {
            this.team = new Team(data.team);
            this.setWorkcode();
            this.teamService.setTeam(data.team);
            this.teamChanged.emit(new Team(data.team));
          }
          this.authService.statusMessage = "Addition complete"
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
    });
  }

  onDelete() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Workcode Deletion', 
      message: 'Are you sure you want to delete this Workcode?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.authService.statusMessage = "Delete team workcode";
        this.dialogService.showSpinner();
        this.teamService.deleteTeamWorkcode(this.team.id, this.selected)
        .subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.selected = 'new';
            if (data && data != null && data.team) {
              this.team = new Team(data.team);
              this.setWorkcode();
              this.teamService.setTeam(data.team);
              this.teamChanged.emit(new Team(data.team));
            }
            this.authService.statusMessage = "Addition complete"
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
      }
    });
  }
}
