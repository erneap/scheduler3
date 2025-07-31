import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { ISite, Site } from 'src/app/models/sites/site';
import { Workcenter } from 'src/app/models/sites/workcenter';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
    selector: 'app-site-editor-workcenter',
    templateUrl: './site-editor-workcenter.component.html',
    styleUrls: ['./site-editor-workcenter.component.scss'],
    standalone: false
})
export class SiteEditorWorkcenterComponent {
  private _team: string = '';
  @Input() 
  public set teamid(id: string) {
    this._team = id;
  }
  get teamid(): string {
    return this._team;
  }
  private _site: Site = new Site();
  @Input()
  public set site(s: ISite) {
    this._site = new Site(s);
    this.setWorkcenterList();
  }
  get site(): Site {
    return this._site;
  }
  @Input() width: number = 1048;
  @Input() height: number = 1000;
  @Output() changed = new EventEmitter<Site>();
  workcenters: ListItem[] = [];
  selected: Workcenter;
  wcForm: FormGroup;
  showSortUp: boolean = false;
  showSortDown: boolean = false;
  posSelectIndex: number = 0;

  constructor(
    protected authService: AuthService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    const iteam = this.teamService.getTeam();
    if (iteam) {
      this.teamid = iteam.id;
    }
    const isite = this.siteService.getSite();
    if (isite) {
      this.site = isite;
    }
    this.selected = new Workcenter();
    this.selected.id = 'new';

    this.wcForm = this.fb.group({
      id: ['', [Validators.required, Validators.pattern('^[a-z0-9\/\-]*$')]],
      name: ['', [Validators.required]]
    });
  }

  pageStyle(): string {
    return `width: ${this.width}px;height: ${this.height}px;`;
  }

  setWorkcenterList() {
    this.workcenters = [];
    this.workcenters.push(new ListItem('new', 'Add New Workcenter'));
    this.site.workcenters.sort((a,b) => a.compareTo(b));
    this.site.workcenters.forEach(wc => {
      this.workcenters.push(new ListItem(wc.id, wc.name));
    });
  }

  setItemClass(id: string): string {
    if (id.toLowerCase() === this.selected.id.toLowerCase()) {
      return `item selected`;
    }
    return 'item';
  }

  onDeleteWorkcenter() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Workcenter Deletion', 
      message: 'Are you sure you want to delete this Workcenter?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        const team = this.teamService.getTeam();
        if (team) {
          this.dialogService.showSpinner();
          this.siteService.deleteWorkcenter(team.id, this.site.id, 
            this.selected.id).subscribe({
            next: (data: SiteResponse) => {
              this.dialogService.closeSpinner();
              if (data && data != null && data.site) {
                this.site = new Site(data.site);
                this.changed.emit(new Site(data.site));
                this.selected = new Workcenter();
                this.selected.id = 'new';
                this.setWorkcenter();
              }
            },
            error: (err: SiteResponse) => {
              this.dialogService.closeSpinner();
              this.authService.statusMessage = err.exception;
            }
          });
        }
      }
    });
  }

  onSelectWorkcenter(id: string) {
    this.selected = new Workcenter();
    this.selected.id = 'new';
    this.showSortDown = false;
    this.showSortUp = false;
    this.posSelectIndex = 0;
    for (let i=0; i < this.site.workcenters.length; i++) {
      if (this.site.workcenters[i].id === id) {
        this.selected = new Workcenter(this.site.workcenters[i]);
        if (this.selected.positions && this.selected.positions.length > 0) {
          this.posSelectIndex = 1;
        }
        if (i > 0) {
          this.showSortUp = true;
        }
        if (i < this.site.workcenters.length - 1) {
          this.showSortDown = true;
        }
      }
    }
    this.setWorkcenter();
  }

  setWorkcenter() {
    if (this.selected.id !== 'new') {
      this.wcForm.controls['id'].setValue(this.selected.id);
    } else {
      this.wcForm.controls['id'].setValue('');
    }
    this.wcForm.controls['name'].setValue(this.selected.name);
  }

  onChangeSort(direction: string) {
    const team = this.teamService.getTeam();
    if (team) {
      this.authService.statusMessage = "Changing Sort Position";
      this.dialogService.showSpinner();
      this.siteService.updateWorkcenter(team.id, this.site.id, 
        this.selected.id, 'move', direction).subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.site) {
            this.site = new Site(data.site);
            this.changed.emit(new Site(data.site));
            const site = this.siteService.getSite();
          }
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
  }

  onChangeField(field: string) {
    if (this.selected.id.toLowerCase() !== 'new' && this.wcForm.valid) {
      let value = '';
      switch (field.toLowerCase()) {
        case "id":
          value = this.wcForm.value.id;
          this.selected = this.wcForm.value.id;
          break;
        case "name":
          value = this.wcForm.value.name;
          break;
      }
      const team = this.teamService.getTeam();
      if (team) {
        this.authService.statusMessage = `Updating Workcenter ${field}`;
        this.dialogService.showSpinner();
        this.siteService.updateWorkcenter(team.id, this.site.id, 
          this.selected.id, field, value).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.site) {
              this.site = new Site(data.site);
              this.changed.emit(new Site(data.site));
            }
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
      }
    }
  }

  onClearClick() {
    this.wcForm.controls['id'].setValue('');
    this.wcForm.controls['name'].setValue('');
  }

  onAddWorkcenter() {
    if (this.wcForm.valid) {
      const team = this.teamService.getTeam();
      if (team) {
        this.dialogService.showSpinner();
        this.authService.statusMessage = "Adding new workcenter"
        this.siteService.addWorkcenter(team.id, this.site.id, 
          this.wcForm.value.id, this.wcForm.value.name).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.site) {
              this.site = new Site(data.site);
              this.onClearClick();
              this.changed.emit(new Site(data.site));
              if (this.site.workcenters) {
                this.site.workcenters?.sort((a,b) => a.compareTo(b));
                const newWc = this.site.workcenters[
                  this.site.workcenters.length - 1];
                this.selected = new Workcenter(newWc);
                this.setWorkcenter();
              }
            }
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
      }
    }
  }

  onChanged(iSite: Site) {
    this.site = iSite;
    this.changed.emit(iSite);
  }
}
