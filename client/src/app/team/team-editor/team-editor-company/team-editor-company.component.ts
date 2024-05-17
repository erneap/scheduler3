import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { Company, ICompany } from 'src/app/models/teams/company';
import { ITeam, Team } from 'src/app/models/teams/team';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-editor-company',
  templateUrl: './team-editor-company.component.html',
  styleUrls: ['./team-editor-company.component.scss']
})
export class TeamEditorCompanyComponent {
  private _team: Team = new Team();
  @Input()
  public set team(t: ITeam) {
    this._team = new Team(t);
    this.setCompanies()
  }
  get team(): Team {
    return this._team;
  }
  private _width: number = 770;
  @Input()
  public set width(w: number) {
    if (w > 770) {
      w = 770;
    }
    this.columnWidth = Math.floor((w - 20) / 3);
    this._width = (this.columnWidth * 3) + 20;
  }
  get width(): number {
    return this._width;
  }
  @Output() changed = new EventEmitter<Team>()
  columnWidth: number = 250;
  companies: ListItem[] = [];
  selected: Company = new Company();
  companyForm: FormGroup;
  showIngestStart: boolean = false;
  weekdays: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday"];

  constructor(
    protected authService: AuthService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.companyForm = this.fb.group({
      id: ['', [Validators.required]],
      name: ['', [Validators.required]],
      ingest: ['manual', [Validators.required]],
      period: "7",
      start: "6",
      holidays: false,
      modtime: false,
    });
    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      this.team = iTeam;
    }
  }

  setCompanies() {
    this.companies = [];
    this.companies.push(new ListItem('new', 'Add New Company'));
    let found = false;
    if (this.team.companies) {
      this.team.companies.sort((a,b) => a.compareTo(b));
      this.team.companies.forEach(co => {
        this.companies.push(new ListItem(co.id, co.name));
        if (co.id.toLowerCase() === this.selected.id.toLowerCase()) {
          this.selected = new Company(co);
          this.setCompany();
        }
      });
    }
  }

  editorStyle(): string {
    return `width: ${this.columnWidth}px;`;
  }

  listStyle(): string {
    let ratio = this.columnWidth / 250;
    if (ratio > 1.0) ratio = 1.0;
    const width = Math.floor(225 * ratio);
    const height = Math.floor(200 * ratio);
    return `width: ${width}px;height: ${height}px;`;
  }

  itemClass(id: string): string {
    if (id.toLowerCase() === this.selected.id.toLowerCase() 
      || (id === 'new' && this.selected.id === '')) {
      return 'item selected';
    }
    return 'item';
  }

  itemStyle(): string {
    let ratio = this.columnWidth / 250;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.9 * ratio;
    const width = Math.floor(224 * ratio);
    const height = Math.floor(20 * ratio);
    return `width: ${width}px;height: ${height}px;font-size: ${fontSize}rem;`;
  }

  onSelect(id: string) {
    this.selected = new Company();
    this.team.companies.forEach(co => {
      if (id.toLowerCase() === co.id.toLowerCase()) {
        this.selected = new Company(co);
      }
    });
    this.setCompany();
  }

  setCompany() {
    this.showIngestStart = false;
    this.companyForm.controls['id'].setValue(this.selected.id);
    this.companyForm.controls['name'].setValue(this.selected.name);
    this.companyForm.controls['ingest'].setValue(this.selected.ingest);
    if (this.selected.ingestPeriod) {
      this.companyForm.controls['period'].setValue(`${this.selected.ingestPeriod}`);
      const nPeriod = Number(this.selected.ingestPeriod);
      this.showIngestStart = nPeriod < 15;
    } else {
      this.showIngestStart = false;
      this.companyForm.controls['period'].setValue('30');
    }
    if (this.selected.startDay) {
      this.companyForm.controls["start"].setValue(this.selected.startDay);
    } else {
      this.companyForm.controls["start"].setValue(0);
    }
    this.companyForm.controls['holidays'].setValue(this.selected.holidays.length > 0);
    this.companyForm.controls['modtime'].setValue(this.selected.modperiods.length > 0);
  }

  formLabelStyle(): string {
    let ratio = this.columnWidth / 250;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.8 * ratio;
    const width = Math.floor(100 * ratio);
    return `width: ${width}px;font-size: ${fontSize}rem;`
  }

  formInputStyle(): string {
    let ratio = this.columnWidth / 250;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.8 * ratio;
    const width = Math.floor(125 * ratio);
    return `width: ${width}px;font-size: ${fontSize}rem;`
  }

  inputStyle(): string {
    let ratio = this.columnWidth / 250;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.8 * ratio;
    return `width: 99%;height: 99%;font-size: ${fontSize}rem;`
  }

  formFullStyle(): string {
    let ratio = this.columnWidth / 250;
    if (ratio > 1.0) ratio = 1.0;
    const fontSize = 0.8 * ratio;
    const width = Math.floor(125 * ratio) + Math.floor(100 * ratio) + 2;
    return `width: ${width}px;font-size: ${fontSize}rem;`
  }

  onAdd() {
    if ((this.selected.id === '' || this.selected.id === 'new') 
      && this.companyForm.valid) {
      this.dialogService.showSpinner();
      const id = this.companyForm.value.id;
      this.teamService.addTeamCompany(this.team.id, id, 
        this.companyForm.value.name, this.companyForm.value.ingest).subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.team) {
            this.team = data.team;
            this.changed.emit(this.team);
            this.team.companies.forEach(co => {
              if (co.id.toLowerCase() === id.toLowerCase()) {
                this.selected = new Company(co);
              }
            })
          }
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
  }

  onUpdate(field: string) {
    if (this.selected.id !== '' && this.selected.id !== 'new') {
      const value = this.companyForm.controls[field].value;
      this.dialogService.showSpinner();
      this.teamService.updateTeamCompany(this.team.id, this.selected.id, field, 
        value).subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.team) {
            this.team = data.team;
            this.changed.emit(this.team);
            this.team.companies.forEach(co => {
              if (co.id.toLowerCase() === this.selected.id.toLowerCase()) {
                this.selected = new Company(co);
              }
            })
          }
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      })
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Company Deletion', 
      message: 'Are you sure you want to delete this Company?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.dialogService.showSpinner();
        this.teamService.deleteTeamCompany(this.team.id, this.selected.id)
        .subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.selected = new Company();
            if (data && data != null && data.team) {
              this.team = data.team;
              this.changed.emit(this.team);
              this.setCompany();
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

  onClear() {
    this.selected = new Company();
    this.setCompany();
  }
}
