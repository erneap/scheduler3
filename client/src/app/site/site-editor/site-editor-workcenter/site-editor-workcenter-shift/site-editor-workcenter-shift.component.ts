import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { ISite, Site } from 'src/app/models/sites/site';
import { IWorkcenter, Shift, Workcenter } from 'src/app/models/sites/workcenter';
import { Team } from 'src/app/models/teams/team';
import { Workcode } from 'src/app/models/teams/workcode';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-editor-workcenter-shift',
  templateUrl: './site-editor-workcenter-shift.component.html',
  styleUrls: ['./site-editor-workcenter-shift.component.scss']
})
export class SiteEditorWorkcenterShiftComponent {
  private _wkctr: Workcenter = new Workcenter();
  @Input()
  public set workcenter(w: IWorkcenter) {
    this._wkctr = new Workcenter(w);
    this.setShifts();
  }
  get workcenter(): Workcenter {
    return this._wkctr;
  }
  private _site: Site = new Site();
  @Input()
  public set site(s: ISite) {
    this._site = new Site(s);
  }
  get site(): Site {
    return this._site;
  }
  private _teamid: string = '';
  @Input() 
  public set teamid(tid: string) {
    this._teamid = tid;
    this.setWorkcodes();
  }
  get teamid(): string {
    return this._teamid;
  }
  @Output() changed = new EventEmitter<Site>();
  shifts: ListItem[] = []
  selected: Shift;
  showSortUp: boolean = false;
  showSortDown: boolean = false;
  workcodes: Workcode[];
  shiftForm: FormGroup;

  constructor(
    protected authService: AuthService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.shiftForm = this.fb.group({
      id: ['', [Validators.required, Validators.pattern('^[a-z0-9\-]*$')]],
      name: ['', [Validators.required]],
      associated: [[], [Validators.required]],
      paycode: 0,
      minimums: [1, [Validators.required]],
    });
    this.selected = new Shift();
    this.selected.id = 'new';

    const isite = this.siteService.getSite();
    if (isite) {
      this.site = isite;
    }

    this.workcodes = [];
    const iteam = this.teamService.getTeam();
    if (iteam) {
      const team = new Team(iteam);
      if (team.workcodes) {
        team.workcodes.forEach(wc => {
          if (!wc.isLeave) {
            this.workcodes.push(new Workcode(wc));
          }
        });
      }
      this.teamid = iteam.id;
    }
  }

  setShifts() {
    this.shifts = [];
    this.shifts.push(new ListItem('new', 'Add New Shift'));
    if (this.workcenter.shifts) {
      this.workcenter.shifts.sort((a,b) => a.compareTo(b));
      this.workcenter.shifts.forEach(shft => {
        this.shifts.push(new ListItem(shft.id, shft.name));
      });
    }
  }

  setItemClass(id: string): string {
    if (id.toLowerCase() === this.selected.id.toLowerCase()) {
      return `item selected`;
    }
    return 'item';
  }

  setWorkcodes() {
    this.workcodes = [];
    this.dialogService.showSpinner();
    this.teamService.retrieveTeam(this.teamid).subscribe({
      next: (resp: SiteResponse) => {
        this.dialogService.closeSpinner();
        if (resp && resp !== null && resp.team) {
          const team = new Team(resp.team);
          team.workcodes.forEach(wc => {
            if (!wc.isLeave) {
              this.workcodes.push(new Workcode(wc));
            }
          });
        }
      },
      error: (err: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = `Error: ${err.exception}`;
      }
    });
  }

  onSelectShift(id: string) {
    this.selected = new Shift();
    this.selected.id = 'new';
    this.showSortDown = false;
    this.showSortUp = false;
    if (this.workcenter.shifts) {
      for (let i=0; i < this.workcenter.shifts.length; i++) {
        if (this.workcenter.shifts[i].id === id) {
          this.selected = new Shift(this.workcenter.shifts[i]);
          if (i > 0) {
            this.showSortUp = true;
          }
          if (i < this.workcenter.shifts.length - 1) {
            this.showSortDown = true;
          }
        }
      }
    }
    this.setShift();
  }

  setShift() {
    if (this.selected.id !== 'new') {
      this.shiftForm.controls['id'].setValue(this.selected.id)
    } else {
      this.shiftForm.controls['id'].setValue('');
    }
    this.shiftForm.controls['name'].setValue(this.selected.name);
    this.shiftForm.controls['minimums'].setValue(this.selected.minimums);
    this.shiftForm.controls['paycode'].setValue(this.selected.payCode);
    let codes: string[] = [];
    if (this.selected.associatedCodes) {
      this.selected.associatedCodes.forEach(ac => {
        codes.push(ac);
      })
    }
    this.shiftForm.controls['associated'].setValue(codes);
  }

  onChangeSort(direction: string) {
    this.dialogService.showSpinner();
    this.siteService.updateWorkcenterShift(this.teamid, this.site.id, 
      this.workcenter.id, this.selected.id, 'move', direction).subscribe({
      next: (data: SiteResponse) => {
        this.dialogService.closeSpinner();
        if (data && data != null && data.site) {
          const site = this.siteService.getSite();
          if (site) {
            if (site.id === data.site.id) {
              this.site = new Site(data.site);
              this.changed.emit(new Site(data.site));
            }
          }
        }
      },
      error: (err: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    });
  }

  onDeleteShift() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Workcenter Shift Deletion', 
      message: 'Are you sure you want to delete this Workcenter Shift?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.authService.statusMessage = "Deleting workcenter shift";
        this.dialogService.showSpinner();
        this.siteService.deleteWorkcenterShift(this.teamid, this.site.id, 
        this.workcenter.id, this.selected.id).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.site) {
              const site = this.siteService.getSite();
              if (site) {
                if (site.id === data.site.id) {
                  this.site = new Site(data.site);
                  this.changed.emit(new Site(data.site));
                  this.selected = new Shift();
                  this.selected.id = 'new';
                  this.setShift();
                }
              }
              this.teamService.setSelectedSite(new Site(data.site));
            }
            this.authService.statusMessage = "Shift deletion complete"
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
      }
    });
  }

  onChangeField(field: string) {
    let outputValue: string = '';
    const value = this.shiftForm.controls[field].value;
    if (field.toLowerCase() === 'associated') {
      let code = '';
      if (this.workcenter.shifts) {
        this.workcenter.shifts.forEach(s => {
          if (s.id.toLowerCase() === this.selected.id.toLowerCase()) {
            if (s.associatedCodes) {
              if (s.associatedCodes.length > value.length) {
                field = 'removecode';
                for (let i=0; i < s.associatedCodes.length && code === ''; i++) {
                  let found = false;
                  for (let j=0; j < value.length && !false; j++) {
                    if (s.associatedCodes[i] === value[j]) {
                      found = true;
                    }
                  }
                  if (!found) {
                    code = s.associatedCodes[i];
                  }
                }
              } else {
                field = 'addcode';
                for (let i=0; i < value.length && code === ''; i++) {
                  let found = false;
                  for (let j=0; j < s.associatedCodes.length && !found; j++) {
                    if (s.associatedCodes[j] === value[i]) {
                      found = true;
                    }
                  }
                  if (!found) {
                    code = value[i];
                  }
                }
              }
            } else if (value.length > 0) {
              code = value[0];
            } else {
              field = '';
            }
          }
        });
      }
      outputValue = code;
    } else {
      outputValue = `${value}`;
    }
    if (field !== '' && this.selected.id !== 'new') {
      this.dialogService.showSpinner();
      this.siteService.updateWorkcenterShift(this.teamid, this.site.id, 
      this.workcenter.id, this.selected.id, field, outputValue).subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.site) {
            const site = this.siteService.getSite();
            if (site) {
              if (site.id === data.site.id) {
                this.site = new Site(data.site);
                this.changed.emit(new Site(data.site));
              }
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

  onAddShift() {
    if (this.shiftForm.controls['id'].valid 
    && this.shiftForm.controls['name'].valid) {
      const shiftID = this.shiftForm.value.id;
      this.authService.statusMessage = "Adding Shift to workcenter";
      this.dialogService.showSpinner();
      this.siteService.addWorkcenterShift(this.teamid, this.site.id, 
      this.workcenter.id, shiftID, this.shiftForm.value.name)
      .subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.site) {
            const site = this.siteService.getSite();
            if (site) {
              if (site.id === data.site.id) {
                this.site = new Site(data.site);
                this.changed.emit(new Site(data.site));
                this.site.workcenters.forEach(wc => {
                  if (wc.id === this.workcenter.id) {
                    this.workcenter = wc;
                    if (this.workcenter.shifts) {
                      this.workcenter.shifts.sort((a,b) => a.compareTo(b))
                      this.selected = new Shift(this.workcenter.shifts[
                        this.workcenter.shifts.length - 1]);
                      this.setShift();
                    }
                  }
                });
              }
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
  }
}
