import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from 'src/app/models/employees/employee';
import { Site } from 'src/app/models/sites/site';
import { Company } from 'src/app/models/teams/company';
import { Team } from 'src/app/models/teams/team';
import { IUser } from 'src/app/models/users/user';
import { MustMatchValidator } from 'src/app/models/validators/must-match-validator.directive';
import { PasswordStrengthValidator } from 'src/app/models/validators/password-strength-validator.directive';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-new-site',
  templateUrl: './new-site.component.html',
  styleUrls: ['./new-site.component.scss']
})
export class NewSiteComponent {
  @Output() added = new EventEmitter<Site>();
  site: Site = new Site();
  employee: Employee = new Employee();
  companies: Company[];
  offsets: number[];
  siteForm: FormGroup;
  leadForm: FormGroup;
  schedulerForm: FormGroup;

  constructor(
    protected authService: AuthService,
    protected empService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private fb: FormBuilder
  ) {
    this.siteForm = this.fb.group({
      id: ['', [Validators.required, Validators.pattern('^[a-z]*[0-9]*$')]],
      title: ['', [Validators.required]],
      mids: false,
      offset: 0.0,
    });
    this.leadForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      first: ['', [Validators.required]],
      middle: '',
      last: ['', [Validators.required]],
      password: ['', [Validators.required, new PasswordStrengthValidator()]],
      password2: ['', [Validators.required, new MustMatchValidator()]]
    });
    this.schedulerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      first: ['', [Validators.required]],
      middle: '',
      last: ['', [Validators.required]],
      password: ['', [Validators.required, new PasswordStrengthValidator()]],
      password2: ['', [Validators.required, new MustMatchValidator()]]
    });
    this.companies = [];
    const team = this.teamService.getTeam();
    if (team && team.companies) {
      team.companies.forEach(co => {
        this.companies.push(new Company(co))
      });
    }
    this.companies.sort((a,b) => a.compareTo(b));
    this.offsets = [];
    for (let i=-11.5; i <= 12.0; i += 0.5) {
      this.offsets.push(i);
    }
    this.offsets.sort((a,b) => a < b ? -1 : 1);
  }
  
  getPasswordError(): string {
    let answer: string = ''
    if (this.schedulerForm.get('password')?.hasError('required')) {
      answer = "Password is Required";
    }
    if (this.schedulerForm.get('password')?.hasError('passwordStrength')) {
      if (answer !== '') {
        answer += ', ';
      }
      answer += "Password doesn't meet minimum requirements";
    }
    return answer;
  }

  getVerifyError(): string {
    let answer: string = ''
    if (this.schedulerForm.get('password2')?.hasError('required')) {
      answer = "Password is Required";
    }
    if (this.schedulerForm.get('password2')?.hasError('matching')) {
      if (answer !== '') {
        answer += ', ';
      }
      answer += "Password doesn't match";
    }
    return answer;
  }
  
  getLeadPasswordError(): string {
    let answer: string = ''
    if (this.leadForm.get('password')?.hasError('required')) {
      answer = "Password is Required";
    }
    if (this.leadForm.get('password')?.hasError('passwordStrength')) {
      if (answer !== '') {
        answer += ', ';
      }
      answer += "Password doesn't meet minimum requirements";
    }
    return answer;
  }

  getLeadVerifyError(): string {
    let answer: string = ''
    if (this.leadForm.get('password2')?.hasError('required')) {
      answer = "Password is Required";
    }
    if (this.leadForm.get('password2')?.hasError('matching')) {
      if (answer !== '') {
        answer += ', ';
      }
      answer += "Password doesn't match";
    }
    return answer;
  }

  addSite() {
    if (this.siteForm.valid && this.leadForm.valid) {
      const lead: IUser = {
        id: '',
        emailAddress: this.leadForm.value.email,
        firstName: this.leadForm.value.first,
        middleName: this.leadForm.value.middle,
        lastName: this.leadForm.value.last,
        password: this.leadForm.value.password,
        passwordExpires: new Date(),
        badAttempts: 0,
        workgroups: [],
      }
      let scheduler: IUser | undefined = undefined
      if (this.schedulerForm.valid) {
        scheduler = {
          id: '',
          emailAddress: this.schedulerForm.value.email,
          firstName: this.schedulerForm.value.first,
          middleName: this.schedulerForm.value.middle,
          lastName: this.schedulerForm.value.last,
          password: this.schedulerForm.value.password,
          passwordExpires: new Date(),
          badAttempts: 0,
          workgroups: [],
        }
      }
      const iTeam = this.teamService.getTeam();
      if (iTeam) {
        this.authService.statusMessage = "Adding New Site";
        this.dialogService.showSpinner();
        this.siteService.AddSite(iTeam.id, this.siteForm.value.id,
          this.siteForm.value.title, this.siteForm.value.mids, 
          Number(this.siteForm.value.offset), lead, scheduler).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.site) {
              this.site = new Site(data.site);
              const site = this.siteService.getSite();
              if (site && data.site.id === site.id) {
                this.siteService.setSite(new Site(data.site));
              }
              this.teamService.setSelectedSite(new Site(data.site));
              const iTeam = this.teamService.getTeam();
              if (iTeam) {
                const team = new Team(iTeam);
                let found = false;
                for (let i=0; i < team.sites.length && !found; i++) {
                  if (team.sites[i].id === this.site.id) {
                    found = true;
                    team.sites[i] = new Site(this.site);
                  }
                }
                if (!found) {
                  team.sites.push(new Site(this.site));
                  team.sites.sort((a,b) => a.compareTo(b));
                }
                this.teamService.setTeam(team);
              }
            }
            this.added.emit(this.site);
            this.authService.statusMessage = "Update complete"
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
      }
    }
  }
}
