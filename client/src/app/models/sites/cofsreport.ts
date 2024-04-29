import { EmployeeLaborCode } from "../employees/employee";
import { IEmployeeLaborCode } from "../employees/employee";

export interface ICofSCompany {
  id: string;
  signature: string;
  sortid: number;
  exercises: boolean;
  laborcodes: IEmployeeLaborCode[];
}

export class CofSCompany implements ICofSCompany {
  id: string;
  signature: string;
  sortid: number;
  exercises: boolean;
  laborcodes: IEmployeeLaborCode[];

  constructor(co?: ICofSCompany) {
    this.id = (co) ? co.id : "";
    this.signature = (co) ? co.signature : "";
    this.sortid = (co) ? co.sortid : 0;
    this.exercises = (co) ? co.exercises : false;
    this.laborcodes = [];
    if (co && co.laborcodes && co.laborcodes.length > 0) {
      co.laborcodes.forEach(lc => {
        this.laborcodes.push(new EmployeeLaborCode(lc));
      });
    }
  }

  compareTo(other?: ICofSCompany): number {
    return (other) ? ((this.sortid < other.sortid) ? -1 : 1) : -1; 
  }
}

export interface ICofSReport {
  id: number;
  name: string;
  shortname: string;
  startdate: Date;
  enddate: Date;
  unit: string;
  companies?: ICofSCompany[];
}

export class CofSReport implements ICofSReport {
  id: number;
  name: string;
  shortname: string;
  startdate: Date;
  enddate: Date;
  unit: string;
  companies: CofSCompany[];

  constructor(rpt?: ICofSReport) {
    this.id = (rpt) ? rpt.id : 0;
    this.name = (rpt) ? rpt.name : "";
    this.shortname = (rpt) ? rpt.shortname : "";
    this.startdate = (rpt) ? new Date(rpt.startdate) : new Date();
    this.enddate = (rpt) ? new Date(rpt.enddate) : new Date();
    this.unit = (rpt) ? rpt.unit : '';
    this.companies = [];
    if (rpt && rpt.companies) {
      rpt.companies.forEach(co => {
        this.companies.push(new CofSCompany(co));
      })
    }
  }

  compareTo(other?: ICofSReport): number {
    if (other) {
      return (this.name < other.name) ? -1 : 1;
    }
    return -1
  }

  reportPeriod(): string {
    const start = `${this.startdate.getMonth() + 1}/`
      + `${this.startdate.getDate()}/`
      + `${this.startdate.getFullYear()}`;
    const end = `${this.enddate.getMonth() + 1}/`
      + `${this.enddate.getDate()}/`
      + `${this.enddate.getFullYear()}`;
    return start + " - " + end;
  }
}