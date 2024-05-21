import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { Team } from 'src/app/models/teams/team';
import { Workcode } from 'src/app/models/teams/workcode';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-editor-workcode',
  templateUrl: './team-editor-workcode.component.html',
  styleUrls: ['./team-editor-workcode.component.scss']
})
export class TeamEditorWorkcodeComponent {
  @Input() width: number = 1200;
  @Input() height: number = 1200;
  @Input() team: Team = new Team();
  @Output() changed = new EventEmitter<Team>();
  selected: Workcode = new Workcode();
  codeForm: FormGroup;

  constructor(
    protected authService: AuthService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.codeForm = this.fb.group({
      id: ['', [Validators.required]],
      title: ['', [Validators.required]],
      start: 0,
      shiftCode: 0,
      altcode: '',
      search: '',
      isleave: false,
      textcolor: '000000',
      backcolor: 'ffffff',
    });
    this.setWorkcode();
  }

  viewStyle(): string {
    return `width: ${this.width}px;height: ${this.height}px;`;
  }

  itemClass(id: string): string {
    if (id === this.selected.id) {
      return 'item selected';
    }
    return 'item';
  }

  spanStyle(wc: Workcode): string {
    return `background-color: #${wc.backcolor};color: #${wc.textcolor};`;
  }

  onSelect(id: string) {
    if (id === '') {
      this.selected = new Workcode();
    } else {
      this.team.workcodes.forEach(wc => {
        if (wc.id === id) {
          this.selected = new Workcode(wc);
        }
      });
    }
    this.setWorkcode();
  }

  setWorkcode() {
    this.codeForm.controls['id'].setValue(this.selected.id);
    this.codeForm.controls['title'].setValue(this.selected.title);
    this.codeForm.controls['start'].setValue(this.selected.start);
    this.codeForm.controls['shiftCode'].setValue(this.selected.shiftCode);
    this.codeForm.controls['altcode'].setValue(this.selected.altcode);
    this.codeForm.controls['search'].setValue(this.selected.search);
    this.codeForm.controls['isleave'].setValue(this.selected.isLeave);
    this.codeForm.controls['textcolor'].setValue(this.selected.textcolor);
    this.codeForm.controls['backcolor'].setValue(this.selected.backcolor);
  }

  setColors(): string {
    if (this.selected.id !== '') {
      return `background-color: #${this.selected.backcolor};`
        + `color: #${this.selected.textcolor};`;
    }
    return `background-color: #ffffff;color: #000000;`;
  }

  checkIDError(): string {
    if (this.codeForm.controls['id'].hasError('required')) {
      return '* required';
    } else {
      if (this.selected.id === '') {
        const tid = this.codeForm.value.id;
        let error = false;
        this.team.workcodes.forEach(wc => {
          if (wc.id.toLowerCase() === tid.toLowerCase()) {
            error = true;
          }
        });
        if (error) {
          return '* Duplicate ID';
        }
      }
    }
    return '';
  }

  onClear() {
    this.selected = new Workcode();
    this.setWorkcode();
  }

  onUpdate(field: string) {
    if (this.selected.id !== '') {
      let value = '';
      switch (field.toLowerCase()) {
        case "isleave":
          value = `${this.codeForm.value.isleave}`;
          break;
        case "start":
          value = `${this.codeForm.value.start}`;
          break;
        default:
          value = this.codeForm.controls[field].value;
      }
      this.dialogService.showSpinner();
      this.teamService.updateTeamWorkcode(this.team.id, this.selected.id, 
        field, value).subscribe({
        next: (resp: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (resp.team) {
            this.team = new Team(resp.team);
            this.team.workcodes.forEach(wc => {
              if (wc.id === this.selected.id) {
                this.selected = new Workcode(wc);
              }
            });
            const iTeam = this.teamService.getTeam();
            if (iTeam && iTeam.id === this.team.id) {
              this.teamService.setTeam(resp.team)
            }
            this.changed.emit(this.team);
          }
        },
        error: (resp: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = resp.exception;
        }
      });
    }
  }

  onAdd() {
    this.authService.statusMessage = "Adding team workcode";
    this.dialogService.showSpinner();
    this.teamService.addTeamWorkcode(this.team.id, 
      this.codeForm.value.id,
      this.codeForm.value.title,
      Number(this.codeForm.value.start),
      this.codeForm.value.isleave,
      this.codeForm.value.premimum,
      this.codeForm.value.textcolor,
      this.codeForm.value.backcolor, 
      this.codeForm.value.altcode,
      this.codeForm.value.search).subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.team) {
            const tTeam = new Team(data.team);
            let newWorkcode = new Workcode();
            tTeam.workcodes.forEach(twc => {
              if (newWorkcode.id === '') {
                let found = false;
                this.team.workcodes.forEach(owc => {
                  if (twc.id === owc.id) {
                    found = true;
                  }
                });
                if (!found) {
                  this.selected = new Workcode(twc);
                }
              }
            });
            this.team = tTeam;
            this.setWorkcode();
            const iTeam = this.teamService.getTeam();
            if (iTeam && iTeam.id === this.team.id) {
              this.teamService.setTeam(this.team);
            }
            this.changed.emit(this.team);
          }
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
        this.teamService.deleteTeamWorkcode(this.team.id, this.selected.id)
        .subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.team) {
              this.team = new Team(data.team);
              this.selected = new Workcode();
              this.setWorkcode();
              const iTeam = this.teamService.getTeam();
              if (iTeam && iTeam.id === this.team.id) {
                this.teamService.setTeam(this.team);
              }
              this.changed.emit(this.team);
            }
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
