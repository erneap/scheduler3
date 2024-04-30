import { Workcenter } from "../sites/workcenter";
import { Workcode } from "../teams/workcode";
import { IUser, User } from "../users/user";
import { Assignment, IAssignment, IVariation, Variation, Workday } from "./assignments";
import { CompanyInfo, ICompanyInfo } from "./company";
import { Contact, IContact, ISpecialty, Specialty } from "./contact";
import { AnnualLeave, IAnnualLeave, ILeaveDay, ILeaveRequest, LeaveDay, LeaveRequest } from "./leave";
import { IWork, Work } from "./work";

export interface IEmployeeName {
  first: string;
  middle: string;
  last: string;
  suffix: string;
}

export class EmployeeName implements IEmployeeName {
  first: string;
  middle: string;
  last: string;
  suffix: string;

  constructor(name?: IEmployeeName) {
    this.first = (name) ? name.first : '';
    this.middle = (name) ? name.middle : '';
    this.last = (name) ? name.last : '';
    this.suffix = (name) ? name.suffix : '';
  }

  getFullName(): string {
    let answer = `${this.first} `
    if (this.middle !== '') {
      answer += `${this.middle.substring(0,1)}. `
    }
    answer += `${this.last}`
    return answer;
  }

  getLastFirst(): string {
    return `${this.last}, ${this.first}`;
  }
}

export interface IEmployeeLaborCode {
  chargeNumber: string;
  extension: string;
}

export class EmployeeLaborCode implements IEmployeeLaborCode {
  chargeNumber: string;
  extension: string;

  constructor(lc?: IEmployeeLaborCode) {
    this.chargeNumber = (lc) ? lc.chargeNumber : '';
    this.extension = (lc) ? lc.extension : '';
  }

  compareTo(other?: EmployeeLaborCode): number {
    if (other) {
      if (this.chargeNumber === other.chargeNumber) {
        return (this.extension < other.extension) ? -1 : 1;
      }
      return (this.chargeNumber < other.chargeNumber) ? -1 : 1;
    }
    return -1;
  }
}

export interface IEmployee {
  id: string;
  team: string;
  site: string;
  email: string;
  name: IEmployeeName;
  companyinfo: ICompanyInfo;
  assignments: IAssignment[];
  variations: IVariation[];
  balance: IAnnualLeave[];
  leaves: ILeaveDay[];
  requests: ILeaveRequest[];
  user?: IUser;
  work?: IWork[];
  contactinfo: IContact[];
  specialties: ISpecialty[];
  emails?: string[];
}

export class Employee implements IEmployee {
  id: string;
  team: string;
  site: string;
  email: string;
  name: EmployeeName;
  companyinfo: CompanyInfo;
  assignments: Assignment[];
  variations: Variation[];
  balance: AnnualLeave[];
  leaves: LeaveDay[];
  requests: LeaveRequest[];
  user?: User;
  work?: Work[];
  contactinfo: Contact[];
  specialties: Specialty[];
  emails: string[];
  even: boolean;

  constructor(emp?: IEmployee) {
    this.id = (emp) ? emp.id : '';
    this.team = (emp) ? emp.team : '';
    this.site = (emp) ? emp.site : '';
    this.email = (emp) ? emp.email : '';
    this.name = (emp) ? new EmployeeName(emp.name) : new EmployeeName();
    this.user = (emp && emp.user) ? new User(emp.user) : undefined;
    if (emp && emp.work) {
      this.work = [];
      emp.work.forEach(wk => {
        this.work?.push(new Work(wk));
      });
      this.work.sort((a,b) => a.compareTo(b));
    }this.companyinfo = (emp) ? new CompanyInfo(emp.companyinfo) : new CompanyInfo();
    this.assignments = [];
    if (emp && emp.assignments && emp.assignments.length > 0) {
      emp.assignments.forEach(asgmt => {
        this.assignments.push(new Assignment(asgmt));
      });
      this.assignments.sort((a,b) => a.compareTo(b))
    }
    this.variations = [];
    if (emp && emp.variations && emp.variations.length > 0) {
      emp.variations.forEach(vari => {
        this.variations.push(new Variation(vari));
      });
      this.variations.sort((a,b) => a.compareTo(b));
    }
    this.balance = [];
    if (emp && emp.balance && emp.balance.length > 0) {
      emp.balance.forEach(bal => {
        this.balance.push(new AnnualLeave(bal));
      });
      this.balance.sort((a,b) => a.compareTo(b));
    }
    this.leaves = [];
    if (emp && emp.leaves && emp.leaves.length > 0) {
      emp.leaves.forEach(lv => {
        this.leaves.push(new LeaveDay(lv));
      });
      this.leaves.sort((a,b) => a.compareTo(b));
    }
    this.requests = [];
    if (emp && emp.requests && emp.requests.length > 0) {
      emp.requests.forEach(req => {
        this.requests.push(new LeaveRequest(req));
      });
      this.requests.sort((a,b) => a.compareTo(b));
    }
    this.contactinfo = [];
    if (emp && emp.contactinfo && emp.contactinfo.length > 0) {
      emp.contactinfo.forEach(ci => {
        this.contactinfo.push(new Contact(ci));
      });
    }
    this.specialties = [];
    if (emp && emp.specialties && emp.specialties.length > 0) {
      emp.specialties.forEach(s => {
        this.specialties.push(new Specialty(s));
      });
    }
    this.emails = [];
    if (emp && emp.emails && emp.emails.length > 0) {
      emp.emails.forEach(em => {
        this.emails.push(em);
      })
    }
    this.even = false;
  }

  compareTo(other?: Employee): number {
    if (other) {
      if (this.name.last === other.name.last) {
        if (this.name.first === other.name.first) {
          return (this.name.middle < this.name.middle) ? -1 : 1;
        }
        return (this.name.first < other.name.first) ? -1 : 1;
      }
      return (this.name.last < other.name.last) ? -1 : 1;
    }
    return -1;
  }

  isActive(): boolean {
    let now = new Date();
    now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const atSite = this.atSite(this.site, now, now);

    return atSite;
  }

  activeOnDate(month: Date): boolean {
    let end = new Date(Date.UTC(month.getFullYear(), month.getMonth() + 1, -1))
    return this.atSite(this.site, month, end);
  }

  getIngestValue(date: Date): string {
    // the ingest value is determined by work performed.  If a labor code was
    // charged or a work record is available for the date, this value is shown
    // as a number.  if the value is zero after checking work, leave is checked
    // for this date and the higher hours work code is displayed.
    let work = 0.0;
    if (this.work && this.work.length > 0) {
      this.work.forEach(wk => {
        if (wk.dateWorked.getFullYear() === date.getFullYear() 
          && wk.dateWorked.getMonth() === date.getMonth()
          && wk.dateWorked.getDate() === date.getDate()
          && !wk.modtime) {
          work += wk.hours;
        }
      });
    }
    if (work > 0.0) {
      return work.toFixed(1);
    }
    let code: string = '';
    let codeHours: number = 0.0;
    if (this.leaves && this.leaves.length > 0) {
      this.leaves.forEach(lv => {
        if (lv.leavedate.getFullYear() === date.getFullYear()
        && lv.leavedate.getMonth() === date.getMonth()
        && lv.leavedate.getDate() === date.getDate()
        && (lv.hours > codeHours || code === '')) {
          code = lv.code;
          codeHours = lv.hours;
        }
      });
    }
    return code;
  }

  isAssigned(site: string, wkctr: string, start: Date, end: Date): boolean {
    let answer = false;
    if (start && end) {
      this.assignments.forEach(asgmt => {
        if (site.toLowerCase() === asgmt.site.toLowerCase()
          && wkctr.toLowerCase() === asgmt.workcenter.toLowerCase()
          && asgmt.startDate.getTime() <= end.getTime()
          && asgmt.endDate.getTime() >= start.getTime()) {
          answer = true;
        }
      });
    }
    return answer;
  }

  atSite(site: string, start: Date, end: Date): boolean {
    let answer = false;
    this.assignments.forEach(asgmt => {
      if (site.toLowerCase() === asgmt.site.toLowerCase()
        && asgmt.startDate.getTime() <= end.getTime()
        && asgmt.endDate.getTime() >= start.getTime()) {
        answer = true;
      }
    });
    return answer;
  }

  addWork(newIWork: IWork) {
    const newWork: Work = new Work(newIWork);
    let found = false;
    if (!this.work) {
      this.work = [];
    } else {
      this.work.forEach(wk => {
        if (wk.dateWorked.getTime() === newWork.dateWorked.getTime() 
          && newWork.chargeNumber === wk.chargeNumber 
          && newWork.extension === wk.extension) {
          found = true;
        }
      })
    }
    if (!found) {
      this.work.push(newWork);
    }
    this.work.sort((a,b) => a.compareTo(b));
  }

  getWorkday(site: string, date: Date, lastWork: Date): Workday {
    let answer: Workday = new Workday();
    let stdHours: number = 8.0;
    let stdCode: string = '';
    let stdWorkCtr: string = '';
    let actualHours: number = 0.0;
    this.assignments.sort((a,b) => a.compareTo(b));
    this.variations.sort((a,b) => a.compareTo(b));
    if (this.work) {
      this.work.forEach(wk => {
        if (date.getFullYear() === wk.dateWorked.getFullYear() 
        && date.getMonth() === wk.dateWorked.getMonth() 
        && date.getDate() === wk.dateWorked.getDate() && !wk.modtime) {
          actualHours += wk.hours;
        }
      });
    }
    this.leaves.forEach(lv => {
      if (lv.status.toLowerCase() === 'actual' 
        && lastWork.getTime() < lv.leavedate.getTime()) {
        lastWork = new Date(lv.leavedate);
      }
    });
    this.assignments.forEach(asgmt => {
      let wd = asgmt.getWorkday(site, date);
      if (wd) {
        answer = new Workday(wd);
      }
      if (asgmt.useAssignment(site, date)) {
        stdHours = asgmt.getStandardWorkHours();
        stdCode = asgmt.getStandardWorkCode(site, date);
        stdWorkCtr = asgmt.getStandardWorkcenter(site, date);
      }
    });
    this.variations.forEach(vari => {
      let wd = vari.getWorkday(site, date);
      if (wd) {
        answer = new Workday(wd);
      }
    });
    if (actualHours > 0.0) {
      if (answer.code === '') {
        answer.code = stdCode;
        answer.hours = actualHours;
        answer.workcenter = stdWorkCtr;
      }
      return answer;
    }
    if (lastWork.getTime() >= date.getTime()) {
      answer.code = "";
      answer.workcenter = "";
      answer.hours = 0.0;
    }
    if (date.getTime() <= lastWork.getTime()) {
      answer.code = '';
      answer.hours = 0;
      answer.workcenter = '';
      this.leaves.forEach(lv => {
        if (lv.leavedate.getFullYear() === date.getFullYear()
        && lv.leavedate.getMonth() === date.getMonth()
        && lv.leavedate.getDate() === date.getDate()
        && lv.hours > answer.hours
        && lv.status.toLowerCase() === 'actual') {
          answer.code = lv.code;
          answer.hours = lv.hours;
          answer.workcenter = '';
        }
      });
    } else {
      this.leaves.forEach(lv => {
        if (lv.leavedate.getFullYear() === date.getFullYear()
          && lv.leavedate.getMonth() === date.getMonth()
          && lv.leavedate.getDate() === date.getDate()) {
            if (lv.hours > (stdHours/2) || 
            (actualHours === 0.0 && date.getTime() <= lastWork.getTime())) {
            answer.code= lv.code;
            answer.hours = lv.hours;
            answer.workcenter = '';
          }
        }
      });
    }
    return answer;
  }

  getWorkdayWOLeaves(site: string, date: Date): Workday {
    let answer: Workday = new Workday();
    let stdHours: number = 8.0;
    this.assignments.sort((a,b) => a.compareTo(b));
    this.variations.sort((a,b) => a.compareTo(b));
    this.assignments.forEach(asgmt => {
      let wd = asgmt.getWorkday(site, date);
      if (wd) {
        answer = new Workday(wd);
      }
      if (asgmt.useAssignment(site, date)) {
        stdHours = asgmt.getStandardWorkHours();
      }
    });
    this.variations.forEach(vari => {
      let wd = vari.getWorkday(site, date);
      if (wd) {
        answer = new Workday(wd);
      }
    });
    return answer;
  }

  getStandardWorkday(site: string, date: Date): number {
    let answer = 8;
    this.assignments.forEach(asgmt => {
      if (asgmt.useAssignment(site, date)) {
        answer = asgmt.getStandardWorkHours();
      }
    });
    return answer;
  }

  hasWorkForYear(year: number): boolean {
    let found = false;
    if (this.work) {
      for (let i=0; i < this.work.length && !found; i++) {
        if (this.work[i].dateWorked.getFullYear() === year) {
          found = true;
        }
      }
    }
    return found;
  }

  showModTime(start: Date, end: Date): boolean {
    start = new Date(start);
    end = new Date(end);
    let balance = 0.0;
    if (this.work) {
      for (let i=0; i < this.work.length; i++) {
        const wk = this.work[i];
        if (wk.dateWorked.getTime() >= start.getTime() 
          && wk.dateWorked.getTime() <= end.getTime()) {
          if (wk.modtime) {
            return true;
          }
        }
      }
    }
    return false;
  }

  getModTimeForPeriod(start: Date, end: Date): number {
    let answer = 0.0;
    start = new Date(start);
    end = new Date(end);
    if (this.work) {
      this.work.forEach(wk => {
        if (wk.modtime && wk.dateWorked.getTime() >= start.getTime() 
          && wk.dateWorked.getTime() <= end.getTime()) {
          answer += wk.hours;
        }
      });
    }
    return answer;
  }

  isLocked(): boolean {
    if (this.user) {
      return this.user.isLocked();
    }
    return false;
  }

  isExpired(): boolean {
    if (this.user) {
      const now = new Date();
      return (now.getTime() > this.user.passwordExpires.getTime());
    }
    return false;
  }
}