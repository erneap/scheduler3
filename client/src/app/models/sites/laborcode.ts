export interface ILaborCode {
  chargeNumber: string;
  extension: string;
  clin: string;
  slin: string;
  location: string;
  wbs: string;
  minimumEmployees: number;
  notAssignedName: string;
  hoursPerEmployee: number;
  exercise: boolean;
  startDate: Date;
  endDate: Date;
}

export class LaborCode implements ILaborCode {
  chargeNumber: string;
  extension: string;
  clin: string;
  slin: string;
  location: string;
  wbs: string;
  minimumEmployees: number;
  notAssignedName: string;
  hoursPerEmployee: number;
  exercise: boolean;
  startDate: Date;
  endDate: Date;

  constructor(lc?: ILaborCode) {
    this.chargeNumber = (lc) ? lc.chargeNumber : '';
    this.extension = (lc) ? lc.extension : '';
    this.clin = (lc) ? lc.clin : '';
    this.slin = (lc) ? lc.slin : '';
    this.location = (lc) ? lc.location : '';
    this.wbs = (lc) ? lc.wbs : '';
    this.minimumEmployees = (lc) ? lc.minimumEmployees : 1;
    this.notAssignedName = (lc) ? lc.notAssignedName : 'Empty';
    this.hoursPerEmployee = (lc) ? lc.hoursPerEmployee : 0.0;
    this.exercise = (lc) ? lc.exercise : false;
    this.startDate = (lc) ? new Date(lc.startDate) : new Date();
    this.endDate = (lc) ? new Date(lc.endDate) : new Date(0);
  }

  compareTo(other?: LaborCode): number {
    if (other) {
      if (this.chargeNumber === other.chargeNumber) {
        return (this.extension < other.extension) ? -1 : 1;
      }
      return (this.chargeNumber < other.chargeNumber) ? -1 : 1;
    }
    return -1;
  }
}

export interface LaborCharge {
  chargenumber: string;
  extension: string;
  checked: boolean;
}