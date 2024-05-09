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
  width: number = 1158;
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
    this.width = this.stateService.viewWidth - 20;
    if (this.width > 1158) this.width = 1158;
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
    if (this.company.ingest !== 'manual') {
      let height = 35;
      if (this.myFiles.length > 1) {
        let tHeight = this.myFiles.length * 22;
        if (tHeight > height) height = tHeight;
      }
      return `bottom: ${height}px;`;
    }
    return `bottom: 10px;`;
  }

  formStyle(): string {
    if (this.company.ingest !== 'manual') {
      let height = 35;
      if (this.myFiles.length > 1) {
        let tHeight = this.myFiles.length * 22;
        if (tHeight > height) height = tHeight;
      }
      return `height: ${height}px;`;
    }
    return `height: 10px;`;
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
