import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MustMatchValidator } from 'src/app/models/validators/must-match-validator.directive';
import { PasswordStrengthValidator } from 'src/app/models/validators/password-strength-validator.directive';
import { AuthenticationRequest } from 'src/app/models/web/employeeWeb';

@Component({
  selector: 'app-user-account-dialog',
  templateUrl: './user-account-dialog.component.html',
  styleUrls: ['./user-account-dialog.component.scss']
})
export class UserAccountDialogComponent {
  dialogForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<UserAccountDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: AuthenticationRequest,
  ) {
    this.dialogForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, new PasswordStrengthValidator()]],
      password2: ['', [Validators.required, new MustMatchValidator()]],
    })
  }

  onCancel(): void {
    this.data.emailAddress = '';
    this.data.password = '';
    this.data.add = false;
    this.dialogRef.close({data: this.data});
  }

  onOkClicked(): void {
    if (this.dialogForm.valid) {
      this.data.emailAddress = this.dialogForm.value.email;
      this.data.password = this.dialogForm.value.password;
      this.data.add = true;
      this.dialogRef.close({data: {emailAddress: this.dialogForm.value.email, 
        password: this.dialogForm.value.password}});
    }
  }
  
  getPasswordError(): string {
    let answer: string = ''
    if (this.dialogForm.get('password')?.hasError('required')) {
      answer = "Password is Required";
    }
    if (this.dialogForm.get('password')?.hasError('passwordStrength')) {
      if (answer !== '') {
        answer += ', ';
      }
      answer += "Password doesn't meet minimum requirements";
    }
    return answer;
  }

  getVerifyError(): string {
    let answer: string = ''
    if (this.dialogForm.get('password2')?.hasError('required')) {
      answer = "Password is Required";
    }
    if (this.dialogForm.get('password2')?.hasError('matching')) {
      if (answer !== '') {
        answer += ', ';
      }
      answer += "Password doesn't match";
    }
    return answer;
  }
}
