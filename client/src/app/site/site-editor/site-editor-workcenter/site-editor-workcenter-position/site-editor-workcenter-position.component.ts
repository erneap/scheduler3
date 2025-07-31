import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { ISite, Site } from 'src/app/models/sites/site';
import { IWorkcenter, Position, Workcenter } from 'src/app/models/sites/workcenter';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
    selector: 'app-site-editor-workcenter-position',
    templateUrl: './site-editor-workcenter-position.component.html',
    styleUrls: ['./site-editor-workcenter-position.component.scss'],
    standalone: false
})
export class SiteEditorWorkcenterPositionComponent {
  private _wkctr: Workcenter = new Workcenter();
  @Input()
  public set workcenter(w: IWorkcenter) {
    this._wkctr = new Workcenter(w);
    this.setPositions();
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
  @Input() teamid: string = '';
  @Output() changed = new EventEmitter<Site>();
  positions: ListItem[] = []
  selected: Position;
  showSortUp: boolean = false;
  showSortDown: boolean = false;
  posForm: FormGroup;

  constructor(
    protected authService: AuthService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.posForm = this.fb.group({
      id: ['', [Validators.required, Validators.pattern('^[a-z0-9\-]*$')]],
      name: ['', [Validators.required]],
      assigned: [],
    });
    this.selected = new Position();
    this.selected.id = 'new';

    const isite = this.siteService.getSite();
    if (isite) {
      this.site = isite;
    }

    const iteam = this.teamService.getTeam();
    if (iteam) {
      this.teamid = iteam.id;
    }
  }

  setPositions() {
    this.positions = [];
    this.positions.push(new ListItem('new', 'Add New Position'));
    if (this.workcenter.positions) {
      this.workcenter.positions.sort((a,b) => a.compareTo(b));
      this.workcenter.positions.forEach(pos => {
        this.positions.push(new ListItem(pos.id, pos.name));
      });
    }
  }

  setItemClass(id: string): string {
    if (id.toLowerCase() === this.selected.id.toLowerCase()) {
      return `item selected`;
    }
    return 'item';
  }

  selectPosition(id: string) {
    this.selected = new Position();
    this.selected.id = 'new';
    this.showSortDown = false;
    this.showSortUp = false;
    if (this.workcenter.positions) {
      for (let i=0; i < this.workcenter.positions.length; i++) {
        if (this.workcenter.positions[i].id === id) {
          this.selected = new Position(this.workcenter.positions[i]);
          if (i > 0) {
            this.showSortUp = true;
          }
          if (i < this.workcenter.positions.length - 1) {
            this.showSortDown = true;
          }
        }
      }
    }
    this.setPosition();
  }

  setPosition() {
    if (this.selected.id !== 'new') {
      this.posForm.controls['id'].setValue(this.selected.id);
    } else {
      this.posForm.controls['id'].setValue('');
    }
    this.posForm.controls['name'].setValue(this.selected.name);
    let empList: string[] = [];
    this.selected.assigned.forEach(empid => {
      empList.push(empid);
    });
    this.posForm.controls['assigned'].setValue(empList);
  }

  onChangeSort(direction: string) {
    this.dialogService.showSpinner();
    this.siteService.updateWorkcenterPosition(this.teamid, this.site.id, 
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

  onDeletePosition() {

  }

  onChangePosition(field: string) {
    let outputValue = '';
    const value = this.posForm.controls[field].value;
    let id: string = ''
    if (field.toLowerCase() === 'assigned') {
      let code = '';
      if (this.workcenter.positions) {
        this.workcenter.positions.forEach(s => {
          if (s.id.toLowerCase() === this.selected.id.toLowerCase()) {
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
    if (field !== '' && this.selected.id !== 'new') {
      this.authService.statusMessage = "Changing Field Value";
      this.dialogService.showSpinner();
      this.siteService.updateWorkcenterPosition(this.teamid, this.site.id, 
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

  onAddPosition() {
    if (this.posForm.controls['id'].valid 
    && this.posForm.controls['name'].valid) {
      const id = this.posForm.value.id;
      const name = this.posForm.value.name;

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
                this.changed.emit(new Site(data.site));
                this.site.workcenters.forEach(wc => {
                  if (this.workcenter.id === wc.id) {
                    this.workcenter = new Workcenter(wc);
                    if (this.workcenter.positions) {
                      this.workcenter.positions.sort((a,b) => a.compareTo(b));
                      this.selected = new Position(this.workcenter.positions[
                        this.workcenter.positions.length - 1]);
                    }
                  }
                });
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
}
