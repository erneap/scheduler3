import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from 'src/app/models/employees/employee';
import { Site } from 'src/app/models/sites/site';
import { Company } from 'src/app/models/teams/company';
import { Team } from 'src/app/models/teams/team';
import { IngestResponse } from 'src/app/models/web/siteWeb';
import { AppStateService } from 'src/app/services/app-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteIngestService } from 'src/app/services/site-ingest.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-ingest-form',
  templateUrl: './site-ingest-form.component.html',
  styleUrls: ['./site-ingest-form.component.scss']
})
export class SiteIngestFormComponent {
  team: Team;
  site: Site;
  width: number = 1048;
  height: number = 700;
  company: Company = new Company();
  myFiles: File[] = [];
  companyForm: FormGroup;
  ingestForm: FormGroup;
  monthShown: Date = new Date();

  constructor(
    protected authService: AuthService,
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected ingestService: SiteIngestService,
    protected stateService: AppStateService,
    protected dialogService: DialogService,
    private fb: FormBuilder
  ) {
    const iTeam = this.teamService.getTeam();
    if (iTeam) {
      this.team = new Team(iTeam);
      this.team.companies.forEach(co => {
        if (co.id === 'rtx') {
          this.company = new Company(co);
        }
      })
    } else {
      this.team = new Team();
    }
    const iSite = this.siteService.getSite();
    if (iSite) {
      this.site = new Site(iSite);
    } else {
      this.site = new Site();
    }
    this.width = this.stateService.viewWidth;
    if (this.stateService.showMenu) {
      this.width -= 250;
    }
    this.companyForm = this.fb.group({
      company: this.company.id,
    });
    this.ingestForm = this.fb.group({
      file: ['', [Validators.required]],
    });
  }

  onChangeCompany() {
    const companyid = this.companyForm.value.company;
    this.team.companies.forEach(co => {
      if (co.id.toLowerCase() === companyid.toLowerCase()) {
        this.company = new Company(co);
      }
    });
  }

  onChangeMonth(dt: Date) {
    this.monthShown = new Date(dt);
  }

  getViewStyle(): string {
   let height = Math.floor(this.stateService.viewHeight / 4);
    if (height > 150) {
      height = 150;
    }

    height = this.stateService.viewHeight - (height + 100);
    if (this.company.ingest.toLowerCase() !== 'manual') {
      if (this.myFiles.length > 1) {
        height -= this.myFiles.length * 20;
      } else {
        height -= 35;
      }
    }
    let width = this.stateService.viewWidth - 20;
    if (this.stateService.showMenu) {
      width -= 250;
    }
    if (width > 1135) {
      width = 1135;
    }

    this.width = width;
    this.height = height;

    return `width: ${width}px;height: ${height}px;`;
  }

  onFileChange(event: any) {
    for (let i=0; i < event.target.files.length; i++) {
      this.myFiles.push(event.target.files[i]);
    }
  }

  onClear() {
    this.myFiles = [];
    this.ingestForm.controls["file"].setValue('');
  }

  onSubmit() {
    const iEmp = this.empService.getEmployee();
    if (iEmp) {
      const formData = new FormData();
      const emp = new Employee(iEmp);
      formData.append("team", emp.team);
      formData.append("site", emp.site);
      formData.append("company", this.company.id);
      let month = `${this.monthShown.getFullYear()}-`;
      if (this.monthShown.getMonth() < 9) {
        month += "0";
      }
      month += `${this.monthShown.getMonth() + 1}-01`;
      formData.append("start", month);
      this.myFiles.forEach(file => {
        formData.append("file", file);
      });

      this.dialogService.showSpinner();
      this.ingestService.fileIngest(formData).subscribe({
        next: (data: IngestResponse) => {
          this.dialogService.closeSpinner();
          if (data && data !== null) {
            const iSite = this.siteService.getSite();
            if (iSite) {
              const site = new Site(iSite);
              if (!site.employees) {
                site.employees = [];
              }
            } 
          }
          this.ingestForm.controls["file"].setValue('');
          this.myFiles = [];
        },
        error: (err: IngestResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
  }
}
