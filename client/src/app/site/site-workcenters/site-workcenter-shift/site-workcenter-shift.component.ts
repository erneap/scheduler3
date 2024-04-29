import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { ISite, Site } from 'src/app/models/sites/site';
import { IWorkcenter, Shift, Workcenter } from 'src/app/models/sites/workcenter';
import { Workcode } from 'src/app/models/teams/workcode';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-workcenter-shift',
  templateUrl: './site-workcenter-shift.component.html',
  styleUrls: ['./site-workcenter-shift.component.scss']
})
export class SiteWorkcenterShiftComponent {
  private _site: Site = new Site();
  private _workcenter: Workcenter = new Workcenter();
  @Input()
  public set site(site: ISite) {
    this._site = new Site(site);
  }
  get site(): Site {
    return this._site;
  }
  @Input()
  public set workcenter(wkctr: IWorkcenter) {
    this._workcenter = new Workcenter(wkctr);
    this.setShifts();
  }
  get workcenter(): Workcenter {
    return this._workcenter;
  }
  @Output() siteChanged = new EventEmitter<Site>();
  shifts: ListItem[] = [];
  selected: string = 'new';
  shift: Shift = new Shift();
  shiftForm: FormGroup;
  workcodes: Workcode[] = [];
  showSortUp: boolean = true;
  showSortDown: boolean = true;
  teamid: string = '';

  constructor(
    protected authService: AuthService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    protected dialog: MatDialog,
    private fb: FormBuilder) {
    this.shiftForm = this.fb.group({
      id: ['', [Validators.required, Validators.pattern('^[a-z0-9\-]*$')]],
      name: ['', [Validators.required]],
      associated: [[], [Validators.required]],
      paycode: 0,
      minimums: [1, [Validators.required]],
    });
    this.workcodes = [];
    const team = this.teamService.getTeam();
    if (team && team.workcodes) {
      this.teamid = team.id;
      team.workcodes.forEach(wc => {
        if (!wc.isLeave) {
          this.workcodes.push(new Workcode(wc));
        }
      });
      this.workcodes.sort((a,b) => a.compareTo(b));
    }
  }

  setShifts() {
    this.shifts = []
    this.shifts.push(new ListItem('new', 'Add New Shift'));
    this.showSortDown = false;
    this.showSortUp = false;
    if (this.workcenter.shifts) {
      const tshifts = this.workcenter.shifts.sort((a,b) => a.compareTo(b));
      for (let i=0; i < tshifts.length; i++) {
        if (tshifts[i].id === this.selected) {
          this.showSortDown = (i < tshifts.length - 1);
          this.showSortUp = (i > 0)
        }
      }
      tshifts.forEach(shft => {
        this.shifts.push(new ListItem(shft.id, shft.name));
      });
    }
  }

  getButtonStyle(id: string): string {
    if (id.toLowerCase() === this.selected.toLowerCase()) {
      return "employee active";
    }
    return "employee";
  }

  onSelectShift(id: string) {
    this.selected = id;
    this.setShift();
    this.setShifts();
  }

  setShift() {
    if (this.selected !== 'new') {
      this.workcenter.shifts?.forEach(sh => {
        if (sh.id.toLowerCase() === this.selected.toLowerCase()) {
          this.shiftForm.controls['id'].setValue(sh.id);
          this.shiftForm.controls['name'].setValue(sh.name);
          this.shiftForm.controls['associated'].setValue(sh.associatedCodes);
          this.shiftForm.controls['paycode'].setValue(sh.payCode);
          this.shiftForm.controls['minimums'].setValue(sh.minimums);
        }
      });
    } else {
      this.shiftForm.controls['id'].setValue('');
      this.shiftForm.controls['name'].setValue('');
      this.shiftForm.controls['associated'].setValue([]);
      this.shiftForm.controls['paycode'].setValue(0);
      this.shiftForm.controls['minimums'].setValue(1);
    }
  }

  onChangeSort(direction: string) {
    this.authService.statusMessage = "Changing Sort Position";
    this.dialogService.showSpinner();
    this.siteService.updateWorkcenterShift(this.teamid, this.site.id, 
      this.workcenter.id, this.selected, 'move', direction).subscribe({
      next: (data: SiteResponse) => {
        this.dialogService.closeSpinner();
        if (data && data != null && data.site) {
          const site = this.siteService.getSite();
          if (site) {
            if (site.id === data.site.id) {
              this.site = new Site(data.site);
              this.siteChanged.emit(new Site(data.site));
              this.siteService.setSite(new Site(data.site));
              if (this.site.workcenters) {
                this.site.workcenters.forEach(wc => {
                  if (wc.id === this.workcenter.id) {
                    this.workcenter = new Workcenter(wc);
                  }
                });
              }
            }
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

  onChangeField(field: string) {
    let outputValue: string = '';
    const value = this.shiftForm.controls[field].value;
    if (field.toLowerCase() === 'associated') {
      let code = '';
      if (this.workcenter.shifts) {
        this.workcenter.shifts.forEach(s => {
          if (s.id.toLowerCase() === this.selected.toLowerCase()) {
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
    if (field !== '' && this.selected !== 'new') {
      this.authService.statusMessage = "Changing Field Value";
      this.dialogService.showSpinner();
      this.siteService.updateWorkcenterShift(this.teamid, this.site.id, 
      this.workcenter.id, this.selected, field, outputValue).subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.site) {
            const site = this.siteService.getSite();
            if (site) {
              if (site.id === data.site.id) {
                this.site = new Site(data.site);
                this.siteChanged.emit(new Site(data.site));
                this.siteService.setSite(new Site(data.site));
                if (this.site.workcenters) {
                  this.site.workcenters.forEach(wc => {
                    if (wc.id === this.workcenter.id) {
                      this.workcenter = new Workcenter(wc);
                      this.setShifts();
                      this.setShift();
                    }
                  });
                }
              }
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
                this.siteChanged.emit(new Site(data.site));
                this.siteService.setSite(new Site(data.site));
                if (this.site.workcenters) {
                  this.site.workcenters.forEach(wc => {
                    if (wc.id === this.workcenter.id) {
                      this.workcenter = new Workcenter(wc);
                      this.selected = shiftID;
                      this.setShifts();
                      this.setShift();
                    }
                  });
                }
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

  showAddButton() {
    return (this.shiftForm.value.id !== '' && this.shiftForm.value.name !== ''
      && this.selected === 'new'); 
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
        this.workcenter.id, this.selected).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.site) {
              const site = this.siteService.getSite();
              if (site) {
                if (site.id === data.site.id) {
                  this.site = new Site(data.site);
                  this.siteChanged.emit(new Site(data.site));
                  this.siteService.setSite(new Site(data.site));
                  if (this.site.workcenters) {
                    this.site.workcenters.forEach(wc => {
                      if (wc.id === this.workcenter.id) {
                        this.workcenter = new Workcenter(wc);
                        this.selected = 'new';
                        this.setShifts();
                        this.setShift();
                      }
                    });
                  }
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
}
