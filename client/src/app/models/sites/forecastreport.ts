import { LaborCode } from "./laborcode";

export interface IForecastPeriod {
  month: Date;
  periods?: Date[];
}

export class ForecastPeriod implements IForecastPeriod {
  month: Date;
  periods?: Date[];

  constructor(per?: IForecastPeriod) {
    this.month = (per) ? new Date(per.month) : new Date();
    this.periods = [];
    if (per && per.periods && per.periods.length > 0) {
      per.periods.forEach(pd => {
        this.periods?.push(new Date(pd))
      });
      this.periods.sort((a,b) => (a.getTime() < b.getTime()) ? -1 : 1);
    }
  }

  compareTo(other?: ForecastPeriod): number {
    if (other) {
      return (this.month.getTime() < other.month.getTime()) ? -1 : 1;
    }
    return -1;
  }
}

export interface IForecastReport {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  periods?: ForecastPeriod[];
  laborCodes?: LaborCode[];
  companyid?: string;
}

export class ForecastReport implements IForecastReport {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  periods?: ForecastPeriod[];
  laborCodes?: LaborCode[];
  companyid?: string;

  constructor(fr?: IForecastReport) {
    this.id = (fr) ? fr.id : 0;
    this.name = (fr) ? fr.name : 'New Forecast';
    this.startDate = (fr) ? new Date(fr.startDate) : new Date();
    this.endDate = (fr) ? new Date(fr.endDate) : new Date();
    this.companyid = (fr && fr.companyid) ? fr.companyid : '';
    this.periods = [];
    if (fr && fr.periods && fr.periods.length > 0) {
      fr.periods.forEach(prd => {
        this.periods?.push(new ForecastPeriod(prd));
      });
      this.periods.sort((a,b) => a.compareTo(b));
    }
    this.laborCodes = [];
    if (fr && fr.laborCodes && fr.laborCodes.length > 0) {
      fr.laborCodes.forEach(lc => {
        this.laborCodes?.push(new LaborCode(lc));
      });
      this.laborCodes.sort((a,b) => a.compareTo(b))
    }
  }

  compareTo(other?: ForecastReport): number {
    if (other) {
      if (this.startDate.getTime() === other.startDate.getTime()) {
        if (this.endDate.getTime() === other.endDate.getTime()) {
          return (this.name < other.name) ? -1 : 1;
        }
        return (this.endDate.getTime() < other.endDate.getTime()) ? -1 : 1;
      }
      return (this.startDate.getTime() < other.startDate.getTime()) ? -1 : 1;
    }
    return -1;
  }

  isActive(dt: Date): boolean {
    return (dt.getTime() >= this.startDate.getTime() 
      && dt.getTime() <= this.endDate.getTime());
  }
}