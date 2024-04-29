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
  selector: 'app-site-workcenters',
  templateUrl: './site-workcenters.component.html',
  styleUrls: ['./site-workcenters.component.scss']
})
export class SiteWorkcentersComponent {
  private _site: Site = new Site()
  @Input()
  public set site(iSite: ISite) {
    this._site = new Site(iSite);
    this.setWorkcenters();
  }
  get site(): Site {
    return this._site;
  }
  @Output() siteChanged = new EventEmitter<Site>();
  workcenters: ListItem[] = [];
  selected: string = '';
  workcenter: Workcenter = new Workcenter();
  showSortUp: boolean = true;
  showSortDown: boolean = true;
  wcForm: FormGroup;

  constructor(
    protected authService: AuthService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    protected dialog: MatDialog,
    private fb: FormBuilder
    ) {
      this.setWorkcenters();
      this.wcForm = this.fb.group({
        id: ['', [Validators.required, Validators.pattern('^[a-z0-9\/\-]*$')]],
        name: ['', [Validators.required]],
      })
    }

  getButtonStyle(id: string): string {
    if (id.toLowerCase() === this.selected.toLowerCase()) {
      return "employee active";
    }
    return "employee";
  }

  setWorkcenters() {
    if (this.site.id === '') {
      const site = this.siteService.getSite();
      if (site) {
        this._site = new Site(site);
      }
    }
    this.workcenters = [];
    this.workcenters.push(new ListItem('new', 'Add New Workcenter'));
    if (this.site && this.site.workcenters) {
      let found = false;
      for (let i=0; i < this.site.workcenters.length; i++) {
        const wc = this.site.workcenters[i];
        this.workcenters.push(new ListItem(wc.id, wc.name));
        if (wc.id.toLowerCase() === this.selected.toLowerCase()) {
          this.workcenter = new Workcenter(wc);
          found = true;
          this.showSortUp =  !(i === 0);
          this.showSortDown =  !(i === this.site.workcenters.length - 1);
        }
      }
      if (!found && this.selected !== 'new' && this.site.workcenters.length > 0) {
        this.workcenter = new Workcenter(this.site.workcenters[0])
        this.selected = this.workcenter.id;
        this.showSortUp = false;
      }
      this.setForm();
    }
  }

  onSelectWorkcenter(wid: string) {
    this.selected = wid;
    this.setWorkcenters();
  }

  setForm() {
    if (this.wcForm) {
      if (this.selected !== 'new') {
        this.wcForm.controls['id'].setValue(this.workcenter.id);
        this.wcForm.controls['name'].setValue(this.workcenter.name);
      } else {
        this.wcForm.controls['id'].setValue('');
        this.wcForm.controls['name'].setValue('');
      }
    }
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
          this.authService.statusMessage = "Changing Sort Position";
          this.dialogService.showSpinner();
          this.siteService.deleteWorkcenter(team.id, this.site.id, 
            this.workcenter.id).subscribe({
              next: (data: SiteResponse) => {
                this.dialogService.closeSpinner();
                if (data && data != null && data.site) {
                  this.site = new Site(data.site);
                  this.siteChanged.emit(new Site(data.site));
                  if (this.site.workcenters) {
                    this.site.workcenters.sort((a,b) => a.compareTo(b));
                    this.selected = this.site.workcenters[0].id
                    this.workcenter = new Workcenter(this.site.workcenters[0]);
                  }
                  const site = this.siteService.getSite();
                  if (site && data.site.id === site.id) {
                    this.siteService.setSite(new Site(data.site));
                  }
                  this.teamService.setSelectedSite(new Site(data.site));
                }
                this.authService.statusMessage = "Retrieval complete"
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

  onChangeSort(direction: string) {
    const team = this.teamService.getTeam();
    if (team) {
      this.authService.statusMessage = "Changing Sort Position";
      this.dialogService.showSpinner();
      this.siteService.updateWorkcenter(team.id, this.site.id, 
        this.workcenter.id, 'move', direction).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.site) {
              this.site = new Site(data.site);
              this.siteChanged.emit(new Site(data.site));
              const site = this.siteService.getSite();
              if (site && data.site.id === site.id) {
                this.siteService.setSite(new Site(data.site));
              }
              this.teamService.setSelectedSite(new Site(data.site));
            }
            this.authService.statusMessage = "Retrieval complete"
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
    }
  }

  onChangeField(field: string) {
    if (this.selected.toLowerCase() !== 'new' && this.wcForm.valid) {
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
          this.workcenter.id, field, value).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.site) {
              this.site = new Site(data.site);
              this.siteChanged.emit(new Site(data.site));
              const site = this.siteService.getSite();
              if (site && data.site.id === site.id) {
                this.siteService.setSite(new Site(data.site));
              }
              this.teamService.setSelectedSite(new Site(data.site));
            }
            this.authService.statusMessage = "Retrieval complete"
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });

      }
    }
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
              this.siteChanged.emit(new Site(data.site));
              if (this.site.workcenters) {
                this.site.workcenters?.sort((a,b) => a.compareTo(b));
                const newWc = this.site.workcenters[
                  this.site.workcenters.length - 1];
                this.selected = newWc.id;
                this.workcenter = new Workcenter(newWc);
              }
              const site = this.siteService.getSite();
              if (site && data.site.id === site.id) {
                this.siteService.setSite(new Site(data.site));
              }
              this.teamService.setSelectedSite(new Site(data.site));
            }
            this.authService.statusMessage = "Addition complete"
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
      }
      this.setWorkcenters();
    }
  }

  onClearClick() {
    this.wcForm.controls['id'].setValue('');
    this.wcForm.controls['name'].setValue('');
  }

  changeSite(iSite: ISite) {
    this.siteChanged.emit(new Site(iSite));
  }
}
