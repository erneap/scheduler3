import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Site } from 'src/app/models/sites/site';
import { Team } from 'src/app/models/teams/team';
import { User } from 'src/app/models/users/user';
import { MustMatchValidator } from 'src/app/models/validators/must-match-validator.directive';
import { PasswordStrengthValidator } from 'src/app/models/validators/password-strength-validator.directive';
import { AuthenticationResponse, InitialResponse } from 'src/app/models/web/employeeWeb';
import { NotificationResponse } from 'src/app/models/web/internalWeb';
import { AppStateService } from 'src/app/services/app-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { MessageService } from 'src/app/services/message.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-forgot-password-reset',
  templateUrl: './forgot-password-reset.component.html',
  styleUrls: ['./forgot-password-reset.component.scss']
})
export class ForgotPasswordResetComponent {
  changeForm: FormGroup;
  errormsg: string = "";

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected employeeService: EmployeeService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected stateService: AppStateService,
    protected msgService: MessageService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.changeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [new PasswordStrengthValidator(), Validators.required]],
      password2: ['', [new MustMatchValidator(), Validators.required]],
      token: ['', [Validators.required]],
    })
  }

  login() {
    if (this.changeForm.valid) {
      this.authService.statusMessage = "Resetting Password";
      this.dialogService.showSpinner();
      this.authService.sendPasswordReset(
        this.changeForm.value.email,
        this.changeForm.value.password,
        this.changeForm.value.token
      ).subscribe({
        next: (data: AuthenticationResponse) => {
          this.errormsg = '';
          this.dialogService.closeSpinner();
          let id = '';
          if (data.user) {
            const user = new User(data.user);
            id = user.id;
            this.authService.setUser(user);
          }
          if (data.token) {
            this.authService.setToken(data.token);
          }
          if (!data.exception || data.exception === '') {
            this.authService.isAuthenticated = true;
            this.authService.startTokenRenewal();
            this.msgService.startAlerts();
            this.authService.statusMessage = "User Login Complete";
            this.getInitialData(id);
          } else {
            this.errormsg = data.exception;
            this.authService.isAuthenticated = false;
          }
        },
        error: (err: AuthenticationResponse) => {
          this.dialogService.closeSpinner();
          this.errormsg = err.exception;
        }
      })
    }
  }

  getInitialData(id: string) {
    this.authService.statusMessage = "Pulling Initial Data";
    this.dialogService.showSpinner();
    this.authService.initialData(id).subscribe({
      next: (data: InitialResponse) => {
        this.dialogService.closeSpinner();
        let site = "";
        let team = "Scheduler";
        if (data.employee) {
          this.employeeService.setEmployee(data.employee)
        }
        if (data.site) {
          const oSite = new Site(data.site);
          this.siteService.setSite(oSite);
          site = oSite.name;
        }
        if (data.team) {
          const oTeam = new Team(data.team);
          team = oTeam.name;
          this.teamService.setTeam(oTeam);
        }
        this.authService.setWebLabel(team, site, this.stateService.viewState);
        this.siteService.startAutoUpdates();
        this.getInitialNotifications(id);
      },
      error: (err: InitialResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = `Problem getting initial data: ${err.exception}`;
      }
    })
  }

  getInitialNotifications(id: string) {
    this.authService.statusMessage = "Checking for notifications";
    this.dialogService.showSpinner()
    this.msgService.getEmployeeMessages(id).subscribe({
      next: (data: NotificationResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = "Initial Notifications reviewed";
        this.msgService.startAlerts();
        if (data && data !== null) {
          if (this.msgService.showAlerts) {
            this.router.navigateByUrl('/notifications');
          } else {
            this.router.navigateByUrl('/employee/schedule');
          }
        }
      },
      error: (err: NotificationResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = `Problem getting notification data: `
          + `${err.exception}`;
      }
    })
  }
  
  getPasswordError(): string {
    let answer: string = ''
    if (this.changeForm.get('password')?.hasError('required')) {
      answer = "Password is Required";
    }
    if (this.changeForm.get('password')?.hasError('passwordStrength')) {
      if (answer !== '') {
        answer += ', ';
      }
      answer += "Password doesn't meet minimum requirements";
    }
    return answer;
  }

  getVerifyError(): string {
    let answer: string = ''
    if (this.changeForm.get('password2')?.hasError('required')) {
      answer = "Password is Required";
    }
    if (this.changeForm.get('password2')?.hasError('matching')) {
      if (answer !== '') {
        answer += ', ';
      }
      answer += "Password doesn't match";
    }
    return answer;
  }
}
