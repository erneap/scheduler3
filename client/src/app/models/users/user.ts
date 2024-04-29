export interface IUser {
  id: string;
  emailAddress: string;
  passwordExpires: Date;
  badAttempts: number;
  firstName: string;
  middleName: string;
  lastName: string;
  workgroups: string[];
  password?: string;
}

export class User implements IUser {
  id: string;
  emailAddress: string;
  passwordExpires: Date;
  badAttempts: number;
  firstName: string;
  middleName: string;
  lastName: string;
  workgroups: string[];

  constructor(user?: IUser) {
    this.id = (user) ? user.id : '';
    this.emailAddress = (user) ? user.emailAddress : '';
    this.passwordExpires = (user) ? new Date(user.passwordExpires) : new Date(0);
    this.badAttempts = (user) ? user.badAttempts : 0;
    this.firstName = (user) ? user.firstName : '';
    this.middleName = (user) ? user.middleName : '';
    this.lastName = (user) ? user.lastName : '';
    this.workgroups = [];
    if (user && user.workgroups && user.workgroups.length > 0) {
      user.workgroups.forEach(wg => {
        this.workgroups.push(wg);
      });
      user.workgroups.sort();
    }
  }

  compareTo(other?: User): number {
    if (other) {
      if (this.lastName === other.lastName) {
        if (this.firstName === other.firstName) {
          return (this.middleName < other.middleName) ? -1 : 1;
        }
        return (this.lastName < other.lastName) ? -1 : 1;
      }
      return (this.lastName < other.lastName) ? -1 : 1;
    }
    return -1;
  }

  getFullName(): string {
    
    if (!this.middleName || this.middleName === '') {
      return `${this.firstName} ${this.lastName}`;
    }
    return `${this.firstName} ${this.middleName.substring(0,1)}. ${this.lastName}`;
  }

  isInGroup(app: string, group: string): boolean {
    let answer = false;
    const testgroup = `${app}-${group}`;
    this.workgroups.forEach(grp => {
      if (testgroup.toLowerCase() === grp.toLowerCase()) {
        answer = true;
      }
    });
    return answer;
  }

  isLocked(): boolean {
    if (this.badAttempts > 2) {
      return true;
    }
    return false;
  }
}