import { outputAst } from '@angular/compiler';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Team } from 'src/app/models/teams/team';
import { IUser } from 'src/app/models/users/user';
import { MustMatchValidator } from 'src/app/models/validators/must-match-validator.directive';
import { PasswordStrengthValidator } from 'src/app/models/validators/password-strength-validator.directive';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-new-team',
  templateUrl: './new-team.component.html',
  styleUrls: ['./new-team.component.scss']
})
export class NewTeamComponent {
  @Output() added = new EventEmitter<Team>();
  teamForm: FormGroup
  leadForm: FormGroup

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected teamService: TeamService,
    private fb: FormBuilder
  ) {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required]],
      workcodes: true,
      
    });
    this.leadForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      first: ['', [Validators.required]],
      middle: '',
      last: ['', [Validators.required]],
      password: ['', [Validators.required, new PasswordStrengthValidator()]],
      password2: ['', [Validators.required, new MustMatchValidator()]]
    })
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

  addTeam() {
    if (this.teamForm.valid && this.leadForm.valid) {
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
      this.authService.statusMessage = "Adding New Team";
      this.dialogService.showSpinner();
      this.teamService.addTeam(this.teamForm.value.name,
        this.teamForm.value.workcodes, lead).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.team) {
              const team = new Team(data.team);
              this.added.emit(team);
            }
            this.authService.statusMessage = "Team Addition complete"
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
      });
    }
  }
}
