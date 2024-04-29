import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ExceptionResponse } from 'src/app/models/web/userWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  loginForm: FormGroup;
  errormsg: string;

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.errormsg = "";
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
    })
  }

  start() {
    if (this.loginForm.valid) {
      this.authService.statusMessage = "Starting Password Recovery"
      this.dialogService.showSpinner();
      this.authService.startPasswordReset(this.loginForm.value.email).subscribe({
        next: () => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = "Recovery Email Sent";
          this.router.navigateByUrl('/reset/finish');
        },
        error: (err: ExceptionResponse) => {
          this.dialogService.closeSpinner();
          console.log(err);
          this.errormsg = err.exception;
        }
      });
    }
  }
}
