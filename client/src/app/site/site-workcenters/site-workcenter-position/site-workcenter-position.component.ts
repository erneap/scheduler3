import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { Employee } from 'src/app/models/employees/employee';
import { ISite, Site } from 'src/app/models/sites/site';
import { IWorkcenter, Position, Workcenter } from 'src/app/models/sites/workcenter';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-workcenter-position',
  templateUrl: './site-workcenter-position.component.html',
  styleUrls: ['./site-workcenter-position.component.scss']
})
export class SiteWorkcenterPositionComponent {
  private _site: Site = new Site();
  private _workcenter: Workcenter = new Workcenter();
  @Input()
  public set site(site: ISite) {
    this._site = new Site(site);
    this.setEmployees();
  }
  get site(): Site {
    return this._site;
  }
  @Input()
  public set workcenter(wkctr: IWorkcenter) {
    this._workcenter = new Workcenter(wkctr);
    this.setPositions();
  }
  get workcenter(): Workcenter {
    return this._workcenter;
  }
  @Output() siteChanged = new EventEmitter<Site>();
  positions: ListItem[] = [];
  selected: string = 'new';
  position: Position = new Position();
  employees: Employee[] = [];
  shiftForm: FormGroup;
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
      id: ['', [Validators.required]],
      name: ['', [Validators.required]],
      assigned: [],
    });
    const team = this.teamService.getTeam();
    if (team) {
      this.teamid = team.id;
    }
  }

  setPositions(): void {
    this.positions = [];
    this.showSortDown = false;
    this.showSortUp = false;
    this.positions.push(new ListItem('new', 'Add New Position'));
    if (this.workcenter.positions) {
      const posits = this.workcenter.positions.sort((a,b) => a.compareTo(b));
      for (let i=0; i < posits.length; i++) {
        this.positions.push(new ListItem(posits[i].id, posits[i].name));
        if (posits[i].id === this.selected) {
          this.showSortUp = (i > 0);
          this.showSortDown = (i < posits.length - 1);
        }
      }
    }
  }

  setPosition() {
    if (this.selected !== 'new') {
      if (this.workcenter.positions) {
        this.workcenter.positions.forEach(pos => {
          if (pos.id === this.selected) {
            this.shiftForm.controls['id'].setValue(pos.id);
            this.shiftForm.controls['name'].setValue(pos.name);
            this.shiftForm.controls['assigned'].setValue(pos.assigned);
          }
        });
      }
    } else {
      this.shiftForm.controls['id'].setValue('');
      this.shiftForm.controls['name'].setValue('');
      this.shiftForm.controls['assigned'].setValue([]);
    }
  }

  setEmployees(): void {
    this.employees = [];
    if (this.site.employees) {
      this.site.employees.forEach(emp => {
        this.employees.push(new Employee(emp));
      })
    }
  }

  selectPosition(id: string) {
    this.selected = id;
    this.setPositions();
    this.setPosition();
  }

  getButtonStyle(id: string): string {
    if (id.toLowerCase() === this.selected.toLowerCase()) {
      return "employee active";
    }
    return "employee";
  }

  onChangeSort(direction: string) {
    this.authService.statusMessage = "Changing Sort Position";
    this.dialogService.showSpinner();
    this.siteService.updateWorkcenterPosition(this.teamid, this.site.id, 
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

  onChangePosition(field: string) {
    let outputValue = '';
    const value = this.shiftForm.controls[field].value;
    let id: string = ''
    if (field.toLowerCase() === 'assigned') {
      let code = '';
      if (this.workcenter.positions) {
        this.workcenter.positions.forEach(s => {
          if (s.id.toLowerCase() === this.selected.toLowerCase()) {
            if (s.assigned) {
              if (s.assigned.length > value.length) {
                field = 'removeassigned';
                for (let i=0; i < s.assigned.length && code === ''; i++) {
                  let found = false;
                  for (let j=0; j < value.length && !false; j++) {
                    if (s.assigned[i] === value[j]) {
                      found = true;
                    }
                  }
                  if (!found) {
                    code = s.assigned[i];
                  }
                }
              } else {
                field = 'addassigned';
                for (let i=0; i < value.length && code === ''; i++) {
                  let found = false;
                  for (let j=0; j < s.assigned.length && !found; j++) {
                    if (s.assigned[j] === value[i]) {
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
        outputValue = code;
      } else {
        outputValue = `${value}`;
      }
    }
    if (field !== '' && this.selected !== 'new') {
      this.authService.statusMessage = "Changing Field Value";
      this.dialogService.showSpinner();
      this.siteService.updateWorkcenterPosition(this.teamid, this.site.id, 
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
                      this.setPositions();
                      this.setPosition();
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

  onAddPosition() {
    if (this.shiftForm.controls['id'].valid 
    && this.shiftForm.controls['name'].valid) {
      const id = this.shiftForm.value.id;
      const name = this.shiftForm.value.name;

      this.authService.statusMessage = "Adding new Workcenter Position";
      this.dialogService.showSpinner();
      this.siteService.addWorkcenterPosition(this.teamid, this.site.id, 
      this.workcenter.id, id, name).subscribe({
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
                      this.selected = id;
                      this.setPositions();
                      this.setPosition();
                    }
                  });
                }
              }
            }
            this.teamService.setSelectedSite(new Site(data.site));
          }
          this.authService.statusMessage = "Add completed"
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
  }

  onDeletePosition() {
    const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
      data: {title: 'Confirm Workcenter Position Deletion', 
      message: 'Are you sure you want to delete this Workcenter Position?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.authService.statusMessage = "Deleting Workcenter Position";
        this.dialogService.showSpinner();
        this.siteService.deleteWorkcenterPosition(this.teamid, this.site.id,
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
                        this.setPositions();
                        this.setPosition();
                      }
                    });
                  }
                }
              }
              this.teamService.setSelectedSite(new Site(data.site));
            }
            this.authService.statusMessage = "Deletion completed"
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
      }
    });
  }

  showAddButton(): boolean {
    return (this.shiftForm.controls['id'].valid 
      && this.shiftForm.controls['name'].valid
      && this.selected === 'new');
  }
}
