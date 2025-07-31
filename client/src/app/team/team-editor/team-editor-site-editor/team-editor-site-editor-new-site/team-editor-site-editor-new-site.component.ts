import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Site } from 'src/app/models/sites/site';
import { Company } from 'src/app/models/teams/company';
import { ITeam, Team } from 'src/app/models/teams/team';
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
    selector: 'app-team-editor-site-editor-new-site',
    templateUrl: './team-editor-site-editor-new-site.component.html',
    styleUrls: ['./team-editor-site-editor-new-site.component.scss'],
    standalone: false
})
export class TeamEditorSiteEditorNewSiteComponent {
  private _team: Team = new Team()
  @Input() 
  public set team(t: ITeam) {
    this._team = new Team(t);
    this.setCompanies();
  }
  get team(): Team {
    return this._team;
  }
  @Input() width: number = 1000;
  @Output() added = new EventEmitter<Site>();
  companies: Company[] = [];
  offsets: number[];
  step: number = 0;
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
    const team = this.teamService.getTeam();
    if (team) {
      this.team = new Team(team);
    }
    this.offsets = [];
    for (let i=-11.5; i <= 12.0; i += 0.5) {
      this.offsets.push(i);
    }
    this.offsets.sort((a,b) => a < b ? -1 : 1);
  }

  setCompanies() {
    this.companies = [];
    this.team.companies.forEach(co => {
      this.companies.push(new Company(co));
    });
    this.companies.sort((a,b) => a.compareTo(b));
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

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  onAdd() {
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
      this.dialogService.showSpinner();
      this.siteService.AddSite(this.team.id, this.siteForm.value.id,
        this.siteForm.value.title, this.siteForm.value.mids, 
        Number(this.siteForm.value.offset), lead, scheduler).subscribe({
        next: (data: SiteResponse) => {
          this.dialogService.closeSpinner();
          if (data && data != null && data.site) {
              this.added.emit(new Site(data.site));
          }
        },
        error: (err: SiteResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
  }

  onClear() {
    this.siteForm.controls['id'].setValue('');
    this.siteForm.controls['title'].setValue('');
    this.siteForm.controls['mids'].setValue(false);
    this.siteForm.controls['offset'].setValue(0.0);
    this.leadForm.controls['email'].setValue('');
    this.leadForm.controls['first'].setValue('');
    this.leadForm.controls['middle'].setValue('');
    this.leadForm.controls['last'].setValue('');
    this.leadForm.controls['password'].setValue('');
    this.leadForm.controls['password2'].setValue('');
    this.schedulerForm.controls['email'].setValue('');
    this.schedulerForm.controls['first'].setValue('');
    this.schedulerForm.controls['middle'].setValue('');
    this.schedulerForm.controls['last'].setValue('');
    this.schedulerForm.controls['password'].setValue('');
    this.schedulerForm.controls['password2'].setValue('');
    this.setStep(0);
  }
}
