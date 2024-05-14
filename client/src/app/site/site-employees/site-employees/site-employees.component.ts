import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { Employee } from 'src/app/models/employees/employee';
import { ISite, Site } from 'src/app/models/sites/site';
import { Message } from 'src/app/models/web/employeeWeb';
import { AppStateService } from 'src/app/services/app-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';

@Component({
  selector: 'app-site-employees',
  templateUrl: './site-employees.component.html',
  styleUrls: ['./site-employees.component.scss']
})
export class SiteEmployeesComponent {
  private _site: Site = new Site();
  @Input()
  public set site(iSite: ISite) {
    this._site = new Site(iSite);
    this.setEmployees();
  }
  get site(): Site {
    return this._site;
  }
  private _width: number = 1048;
  @Input()
  public set width(w: number) {
    this._width = w;
  }
  get width(): number {
    return this._width;
  }
  private _height: number = 1048;
  @Input()
  public set height(h: number) {
    this._height = h;
  }
  get height(): number {
    return this._height;
  }
  @Output() siteChanged = new EventEmitter<Site>();

  activeOnly: boolean = true;
  employees: ListItem[] = [];
  selected: Employee;

  constructor(
    protected siteService: SiteService,
    protected empService: EmployeeService,
    protected appState: AppStateService,
    protected dialogService: DialogService,
    protected authService: AuthService
  ) {
    const isite = this.siteService.getSite();
    if (isite) {
      this.site = new Site(isite);
      this.setEmployees();
    }
    this.selected = new Employee();
    this.selected.id = 'new';
    this.height = this.appState.viewHeight - 73;
    this.width = this.appState.viewWidth;
  }

  setEmployees(): void {
    this.employees = [];

    this.employees.push(new ListItem('new', 'Add New Employee'));
    if (this.site.employees) {
      this.site.employees.forEach(iEmp => {
        const emp = new Employee(iEmp)
        if ((this.activeOnly && emp.isActive()) || !this.activeOnly) {
          this.employees.push(new ListItem(emp.id, emp.name.getLastFirst()));
        } 
      });
    }
  }

  itemStyle(id: string): string {
    let answer = 'item';
    if (this.selected.id === id) {
      return 'item selected';
    }
    if (this.site.employees) {
      this.site.employees.forEach(emp => {
        if (emp.id === id) {
          if (emp.isExpired()) {
            answer = 'item expired';
          } else if (emp.isLocked()) {
            answer = 'item locked';
          }
        }
      });
    }
    return answer;
  }

  selectEmployee(id: string) {
    this.selected = new Employee();
    this.selected.id = 'new';
    if (this.site.employees) {
      this.site.employees.forEach(emp => {
        if (emp.id === id) {
          this.selected = new Employee(emp);
        }
      });
    }
  }

  employeeChanged(emp: Employee) {
    if (this.site.employees) {
      let found = false;
      for (let i=0; i < this.site.employees.length && !found; i++) {
        if (this.site.employees[i].id === emp.id) {
          found = true;
          this.site.employees[i] = new Employee(emp);
        }
      }
      if (!found) {
        this.site.employees.push(new Employee(emp));
        this.site.employees.sort((a,b) => a.compareTo(b));
        this.selected = new Employee(emp);
      }
    } else {
      this.site.employees = [];
      this.site.employees.push(new Employee(emp));
      this.selected = new Employee(emp);
    }
    const iSite = this.siteService.getSite();
    if (iSite && iSite.id === this.site.id) {
      this.siteService.setSite(this.site);
    }
    this.siteChanged.emit(this.site);
  }

  deleteEmployee(id: string) {
    if (id !== '' && id !== 'new') {
      this.dialogService.showSpinner();
      this.empService.deleteEmployee(id).subscribe({
        next: (data: Message) => {
          this.dialogService.closeSpinner();
          if (data.message.toLowerCase() === 'employee deleted') {
            if (this.site.employees) {
              let pos = -1;
              for (let i=0; i < this.site.employees.length; i++) {
                if (this.site.employees[i].id === id) {
                  pos = i;
                }
              }
              if (pos >= 0) {
                this.site.employees.splice(pos, 1);
                const iSite = this.siteService.getSite();
                if (iSite && iSite.id === this.site.id) {
                  this.siteService.setSite(this.site);
                }
                this.setEmployees();
                this.siteChanged.emit(this.site);
              }
            }
          }
        },
        error: (err: Message) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.message;
        }
      });
    }
  }
}
