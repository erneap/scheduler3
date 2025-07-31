import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/users/user';
import { AuthenticationResponse } from 'src/app/models/web/employeeWeb';
import { UsersResponse } from 'src/app/models/web/userWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';

@Component({
    selector: 'app-admin-users-tool',
    templateUrl: './admin-users-tool.component.html',
    styleUrls: ['./admin-users-tool.component.scss'],
    standalone: false
})
export class AdminUsersToolComponent {
  userList: User[] = [];
  userForm: FormGroup;
  selectedUser: User = new User();
  permissions: string[] = ['scheduler-employee', 'scheduler-scheduler', 
    'scheduler-company', 'scheduler-siteleader', 'scheduler-teamleader', 
    'scheduler-admin', 'metrics-GEOINT', 'metrics-XINT', 'metrics-DDSA',
    'metrics-ADMIN'];
  permNames: string[] = ['Employee', 'Site Scheduler', 
    'Site Company Leader', 'Site Leader', 
    'Team Leader', 'Scheduler/Admin', 'GEOINT', 'XINT',
    'DDSA', 'Metrics/Admin'];

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      perms: [[], [Validators.required]],
      password: ['', [Validators.required]],
    });
    this.getUsersList();
  }

  getUsersList() {
    this.userList = [];
    this.dialogService.showSpinner();
    this.authService.getAllUsers().subscribe({
      next: (resp: UsersResponse) => {
        this.dialogService.closeSpinner();
        if (resp && resp !== null && resp.users) {
          resp.users.forEach(user => {
            if (user.lastName !== '') {
              this.userList.push(new User(user));
            }
          });
          this.userList.sort((a,b) => a.compareTo(b));
        }
      },
      error: err => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    })
  }

  userClass(user: User): string {
    let answer = 'item ';
    let now = new Date();
    if (user.passwordExpires.getTime() < now.getTime()) {
      answer += 'expired';
    } else if (user.isLocked()) {
      answer += 'locked';
    } else {
      answer += 'normal';
    }
    if (this.selectedUser.id === user.id) {
      answer += ' selected'
    }
    return answer;
  }

  onSelect(id: string) {
    this.selectedUser = new User();
    this.userForm.controls['perms'].setValue([]);
    this.userForm.controls['password'].setValue('');
    this.userList.forEach(user => {
      if (user.id === id) {
        this.selectedUser = new User(user);
        this.userForm.controls['perms'].setValue(user.workgroups);
        this.userForm.controls['password'].setValue('');
      }
    });
  }

  onAdd5Days() {
    this.dialogService.showSpinner();
    this.authService.changeUser(this.selectedUser.id, '5days', '').subscribe({
      next: resp => {
        this.dialogService.closeSpinner();
        let found = false;
        if (resp && resp.user) {
          for (let i=0; i < this.userList.length && !found; i++) {
            if (this.userList[i].id === resp.user.id) {
              this.userList[i] = new User(resp.user);
              this.selectedUser = new User(resp.user);
              this.onSelect(this.selectedUser.id);
            }
          }
        }
      },
      error: (err: AuthenticationResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    });
  }

  changePermission() {
    const newperms: string[] = this.userForm.value.perms;
    let add = '';
    let remove = '';
    newperms.forEach(np => {
      let found = false;
      this.selectedUser.workgroups.forEach(wg => {
        if (wg === np) {
          found = true;
        }
      });
      if (!found) {
        add = np;
      }
    });
    this.selectedUser.workgroups.forEach(wg => {
      let found = false;
      newperms.forEach(np => {
        if (np === wg) {
          found = true;
        }
      });
      if (!found) {
        remove = wg;
      }
    });
    let value = '';
    let action = '';
    if (add !== '') {
      action = 'addperm';
      value = add;
    } else if (remove !== '') {
      action = 'removeperm';
      value = remove;
    }
    this.dialogService.showSpinner();
    this.authService.changeUser(this.selectedUser.id, action, value).subscribe({
      next: resp => {
        this.dialogService.closeSpinner();
        let found = false;
        if (resp && resp.user) {
          for (let i=0; i < this.userList.length && !found; i++) {
            if (this.userList[i].id === resp.user.id) {
              this.userList[i] = new User(resp.user);
              this.selectedUser = new User(resp.user);
              this.onSelect(this.selectedUser.id);
            }
          }
        }
      },
      error: (err: AuthenticationResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    });
  }

  onUnlock() {
    this.dialogService.showSpinner();
    this.authService.changeUser(this.selectedUser.id, 'unlock', '').subscribe({
      next: resp => {
        this.dialogService.closeSpinner();
        let found = false;
        if (resp && resp.user) {
          for (let i=0; i < this.userList.length && !found; i++) {
            if (this.userList[i].id === resp.user.id) {
              this.userList[i] = new User(resp.user);
              this.selectedUser = new User(resp.user);
              this.onSelect(this.selectedUser.id);
            }
          }
        }
      },
      error: (err: AuthenticationResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    });
  }

  changePassword() {
    const passwd = this.userForm.value.password;
    if (passwd !== '') {
      this.dialogService.showSpinner();
      this.authService.changeUser(this.selectedUser.id, 'password', passwd)
      .subscribe({
        next: resp => {
          this.dialogService.closeSpinner();
          let found = false;
          if (resp && resp.user) {
            for (let i=0; i < this.userList.length && !found; i++) {
              if (this.userList[i].id === resp.user.id) {
                this.userList[i] = new User(resp.user);
                this.selectedUser = new User(resp.user);
                this.onSelect(this.selectedUser.id);
              }
            }
          }
        },
        error: (err: AuthenticationResponse) => {
          this.dialogService.closeSpinner();
          this.authService.statusMessage = err.exception;
        }
      });
    }
  }
}
