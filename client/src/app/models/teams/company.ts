import { ILeaveDay, LeaveDay } from "../employees/leave";

export class CompanyHolidays {
  year: number;
  holidays: CompanyHoliday[];

  constructor(yr: number, holidays?: CompanyHoliday[]) {
    this.year = yr
    this.holidays = [];
    if (holidays && holidays.length > 0) {
      holidays.sort((a,b) => a.compareTo(b));
      holidays.forEach(hol => {
        const cHol = new CompanyHoliday(hol);
        this.holidays.push(cHol)
      });
    }
  }

  hasLeaveDay(dt: Date): boolean {
    let answer = false;
    this.holidays.forEach(hol => {
      if (hol.hasLeaveDay(new Date(dt))) {
        answer = true;
      }
    });
    return answer;
  }
}

export interface ICompanyHoliday {
  id: string;
  name: string;
  sort: number;
  actualdates?: Date[];
}

export class CompanyHoliday implements ICompanyHoliday {
  id: string;
  name: string;
  sort: number;
  actualdates: Date[];
  leaveDays: LeaveDay[] = [];
  active: boolean = true;

  constructor(hol?: ICompanyHoliday) {
    this.id = (hol) ? hol.id : 'H';
    this.name = (hol) ? hol.name : '';
    this.sort = (hol) ? hol.sort : 0;
    this.actualdates = [];
    if (hol && hol.actualdates && hol.actualdates.length > 0) {
      hol.actualdates.forEach(dt => {
        this.actualdates?.push(new Date(dt));
      });
      this.actualdates.sort((a,b) => {
        return (a.getTime() < b.getTime()) ? -1 : 1;
      })
    }
  }

  compareTo(other?: CompanyHoliday): number {
    if (other) {
      if (this.id.toLowerCase() === other.id.toLowerCase()) {
        return (this.sort < other.sort) ? -1 : 1
      }
      return (this.id.toLowerCase() === 'h') ? -1 : 1;
    }
    return -1;
  }

  getActual(year: number): Date | undefined {
    let answer: Date | undefined;
    if (this.actualdates) {
      this.actualdates.forEach(dt => {
        if (dt.getUTCFullYear() === year) {
          answer = dt;
        }
      });
    }
    return answer;
  }

  addLeaveDay(lv: ILeaveDay) {
    if (!this.leaveDays) {
      this.leaveDays = [];
    }
    this.leaveDays.push(new LeaveDay(lv));
    this.leaveDays.sort((a,b) => a.compareTo(b));
  }

  getLeaveDayTotalHours(): number {
    let total = 0.0;
    if (this.leaveDays) {
      this.leaveDays.forEach(dt => {
        total += dt.hours;
      })
    }
    return total;
  }

  hasLeaveDay(dt: Date): boolean {
    let answer = false;
    this.leaveDays.forEach(day => {
      if (dt.getUTCFullYear() === day.leavedate.getUTCFullYear() 
        && dt.getUTCMonth() === day.leavedate.getUTCMonth()
        && dt.getUTCDate() === day.leavedate.getUTCDate()) {
        answer = true;
      }
    });
    return answer;
  }
}

export interface IModPeriod {
  year: number;
  start: Date;
  end: Date;
}

export class ModPeriod implements IModPeriod {
  year: number;
  start: Date;
  end: Date;

  constructor(mod?: IModPeriod) {
    this.year = (mod) ? mod.year : 0;
    this.start = (mod) ? new Date(mod.start) : new Date(0);
    this.end = (mod) ? new Date(mod.end) : new Date(0);
  }

  compareTo(other?: ModPeriod): number {
    if (other) {
      return this.year < other.year ? -1 : 1;
    }
    return 0;
  }
}

export interface ICompany {
  id: string;
  name: string;
  ingest: string;
  ingestPwd: string;
  ingestPeriod?: number;
  startDay?: number;
  holidays?: ICompanyHoliday[];
  modperiods?: IModPeriod[];
}

export class Company implements ICompany {
  id: string;
  name: string;
  ingest: string;
  ingestPwd: string;
  ingestPeriod: number;  // default to weekly
  startDay: number;      // default to Saturday
  holidays: CompanyHoliday[];
  modperiods: ModPeriod[];

  constructor(com?: ICompany) {
    this.id = (com) ? com.id : '';
    this.name = (com) ? com.name : '';
    this.ingest = (com) ? com.ingest : 'manual';
    this.ingestPwd = (com) ? com.ingestPwd : '';
    this.ingestPeriod = (com && com.ingestPeriod && com.ingestPeriod > 0) 
      ? com.ingestPeriod : 7;
    this.startDay = (com && com.startDay) ? com.startDay : 6;
    this.holidays = [];
    if (com && com.holidays && com.holidays.length > 0) {
      com.holidays.forEach(hol => {
        this.holidays.push(new CompanyHoliday(hol));
      });
      this.holidays.sort((a,b) => a.compareTo(b));
    }
    this.modperiods = [];
    if (com && com.modperiods && com.modperiods.length > 0) {
      com.modperiods.forEach(mod => {
        this.modperiods.push(new ModPeriod(mod));
      });
      this.modperiods.sort((a,b) => a.compareTo(b))
    }
  }

  compareTo(other?: Company): number {
    if (other) {
      return (this.name < other.name) ? -1 : 1;
    }
    return -1;
  }
}