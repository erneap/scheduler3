import { Employee, IEmployee } from "../employees/employee";
import { CofSReport, ICofSReport } from "./cofsreport";
import { ForecastReport, IForecastReport } from "./forecastreport";
import { ILaborCode, LaborCode } from "./laborcode";
import { IWorkcenter, Workcenter } from "./workcenter";

export interface ISite {
  id: string;
  name: string;
  showMids: boolean;
  utcOffset?: number;
  workcenters?: IWorkcenter[];
  laborCodes?: ILaborCode[];
  forecasts?: IForecastReport[];
  cofs?: ICofSReport[];
  employees?: IEmployee[];
}

export class Site implements ISite {
  id: string;
  name: string;
  showMids: boolean;
  utcOffset?: number;
  workcenters: Workcenter[];
  laborCodes: LaborCode[];
  forecasts: ForecastReport[];
  cofs: CofSReport[];
  employees?: Employee[];

  constructor(site?: ISite) {
    this.id = (site) ? site.id : '';
    this.name = (site) ? site.name : '';
    this.showMids = (site) ? site.showMids : true;
    this.utcOffset = (site && site.utcOffset) ? site.utcOffset : 0;
    this.workcenters = [];
    if (site && site.workcenters && site.workcenters.length > 0) {
      site.workcenters.forEach(wc => {
        this.workcenters?.push(new Workcenter(wc));
      });
      this.workcenters.sort((a,b) => a.compareTo(b))
    }
    this.laborCodes = [];
    if (site && site.laborCodes && site.laborCodes.length > 0) {
      site.laborCodes.forEach(lc => {
        this.laborCodes?.push(new LaborCode(lc));
      });
      this.laborCodes.sort((a,b) => a.compareTo(b));
    }
    this.forecasts = [];
    if (site && site.forecasts && site.forecasts.length > 0) {
      site.forecasts.forEach(fc => {
        this.forecasts?.push(new ForecastReport(fc));
      });
      this.forecasts.sort((a,b) => a.compareTo(b))
    }
    this.cofs = [];
    if (site && site.cofs && site.cofs.length > 0) {
      site.cofs.forEach(cs => {
        this.cofs.push(new CofSReport(cs));
      })
    }
    this.employees = [];
    if (site && site.employees && site.employees.length > 0) {
      site.employees.forEach(emp => {
        this.employees?.push(new Employee(emp));
      });
      this.employees.sort((a,b) => a.compareTo(b));
    }
  }

  compareTo(other?: Site): number {
    if (other) {
      if (this.name === other.name) {
        return (this.id < other.id) ? -1 : 1;
      }
      return (this.name < other.name) ? -1 : 1;
    }
    return -1;
  }

  hasEmployeeWork(year: number): boolean {
    let found = false;
    if (this.employees) {
      this.employees.forEach(emp => {
        if (emp.work) {
          emp.work.forEach(wk => {
            if (wk.dateWorked.getFullYear() === year) {
              found = true;
            }
          });
        }
      });
    }
    return found;
  }

  clearScheduleEmployees() {
    if (this.workcenters) {
      this.workcenters.forEach(wc => {
        if (wc.positions) {
          wc.positions.forEach(pos => {
            if (pos.employees) {
              pos.employees = [];
            }
          });
        }
        if (wc.shifts) {
          wc.shifts.forEach(shft => {
            if (shft.employees) {
              shft.employees = [];
            }
          });
        }
      });
    }
  }
}