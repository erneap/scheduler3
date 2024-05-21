import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { SpecialtyType } from 'src/app/models/teams/contacttype';
import { ITeam, Team } from 'src/app/models/teams/team';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-editor-specialtytypes',
  templateUrl: './team-editor-specialtytypes.component.html',
  styleUrls: ['./team-editor-specialtytypes.component.scss']
})
export class TeamEditorSpecialtytypesComponent {
  private _team: Team = new Team();
  @Input() 
  public set team(t: ITeam) {
    this._team = new Team(t);
    this._team.contacttypes.sort((a,b) => a.compareTo(b));
  }
  get team(): Team {
    return this._team;
  }
  @Input() width: number = 400;
  @Output() changed = new EventEmitter<Team>();
  selected: SpecialtyType = new SpecialtyType();
  showSortDown: boolean = false;
  showSortUp: boolean = false;
  typeForm: FormGroup;

  constructor(
    protected authService: AuthService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.typeForm = this.fb.group({
      name: ['', [Validators.required]],
    });
  }

  listStyle(): string {
    let ratio = this.width / 400;
    if (ratio > 1.0) ratio = 1.0;
    const width = Math.floor(375 * ratio);
    let height = Math.floor(250 * ratio);
    height *= 2;
    return `width: ${width}px;height: ${height}px;`;
  }

  itemClass(id: string): string {
    if (id === `${this.selected.id}`) {
      return 'item selected';
    }
    return 'item';
  }

  itemStyle(): string {
    let ratio = this.width / 400;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.9 * ratio;
    const width = Math.floor(374 * ratio);
    const height = Math.floor(20 * ratio);
    return `width: ${width}px;height: ${height}px;font-size: ${fontSize}rem;`;
  }

  sortStyle(): string {
    let ratio = this.width / 400;
    if (ratio > 1.0) ratio = 1.0;
    const width = Math.floor(25 * ratio);
    let height = Math.floor(250 * ratio);
    height *= 2;
    return `width: ${width}px;height: ${height}px;`;
  }

  moveStyle(): string {
    let ratio = this.width / 400;
    if (ratio > 1.0) ratio = 1.0;
    const width = Math.floor(25 * ratio);
    const height = Math.floor(250 * ratio);
    return `width: ${width}px;height: ${height}px;`;
  }

  onSelect(id: string) {
    this.selected = new SpecialtyType();
    this.showSortDown = false;
    this.showSortUp = false;
    this.team.specialties.sort((a,b) => a.compareTo(b));
    for (let i=0; i < this.team.specialties.length; i++) {
      if (`${this.team.specialties[i].id}` === id) {
        this.selected = new SpecialtyType(this.team.specialties[i]);
        this.showSortUp = (i > 0);
        this.showSortDown = (i < this.team.specialties.length - 1);
      }
    }
    this.typeForm.controls['name'].setValue(this.selected.name);
  }

  onChangeSort(direction: string) {
    this.dialogService.showSpinner();
    this.teamService.updateSpecialtyType(this.team.id, this.selected.id, 'sort', 
      direction).subscribe({
      next: (data: SiteResponse) => {
        this.dialogService.closeSpinner();
        if (data && data !== null && data.team) {
          this.team = data.team;
          this.changed.emit(this.team);
          this.onSelect(this.selected.id.toFixed(0));
        }
      },
      error: (err: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    })
  }

  formLabelStyle(): string {
    let ratio = this.width / 400;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.9 * ratio;
    const width = Math.floor(100 * ratio);
    return `width: ${width}px;font-size: ${fontSize}rem;`;
  }

  formInputStyle(): string {
    let ratio = this.width / 400;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.9 * ratio;
    const width = Math.floor(300 * ratio);
    return `width: ${width}px;font-size: ${fontSize}rem;`;
  }

  inputStyle(): string {
    let ratio = this.width / 400;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.9 * ratio;
    const width = Math.floor(300 * ratio);
    return `width: 99%;height: 99%;font-size: ${fontSize}rem;`;
  }

  formFullStyle(): string {
    let ratio = this.width / 400;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.9 * ratio;
    const width = Math.floor(400 * ratio);
    return `width: ${width}px;font-size: ${fontSize}rem;`;
  }

  onClear() {
    this.selected = new SpecialtyType();
  }

  onUpdate() {
    if (this.selected.id > 0) {
      this.dialogService.showSpinner();
      this.teamService.updateSpecialtyType(this.team.id, this.selected.id, 'name',
      this.typeForm.value.name).subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null && data.team) {
            this.team = data.team;
            this.changed.emit(this.team);
            this.onSelect(this.selected.id.toFixed(0));
          }
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      })
    }
  }

  onAdd() {
    if (this.selected.id === 0) {
      this.dialogService.showSpinner();
      this.teamService.addSpecialtyType(this.team.id, this.selected.id, 
      this.typeForm.value.name).subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null && data.team) {
            this.team = data.team;
            this.changed.emit(this.team);
            this.team.specialties.sort((a,b) => a.compareTo(b));
            let id = this.team.specialties[this.team.specialties.length -1].id;
            this.onSelect(id.toFixed(0));
          }
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Specialty Type Deletion', 
      message: 'Are you sure you want to delete this Company?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.dialogService.showSpinner();
        this.teamService.deleteSpecialtyType(this.team.id, this.selected.id)
        .subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.selected = new SpecialtyType();
            if (data && data != null && data.team) {
              this.team = data.team;
              this.changed.emit(this.team);
              this.onSelect('');
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
