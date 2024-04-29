export interface IWork {
  dateWorked: Date;
  chargeNumber: string;
  extension: string;
  payCode: number;
  modtime?: boolean;
  hours: number;
}

export class Work implements IWork {
  dateWorked: Date;
  chargeNumber: string;
  extension: string;
  payCode: number;
  modtime: boolean;
  hours: number;

  constructor(wk?: IWork) {
    this.dateWorked = (wk) ? new Date(wk.dateWorked) : new Date(0);
    this.chargeNumber = (wk) ? wk.chargeNumber : '';
    this.extension = (wk) ? wk.extension : '';
    this.payCode = (wk) ? wk.payCode : 1;
    this.modtime = (wk && wk.modtime) ? wk?.modtime : false;
    this.hours = (wk) ? wk.hours : 0.0;
  }

  compareTo(other?: Work): number {
    if (other) {
      if (this.dateWorked.getFullYear() === other.dateWorked.getFullYear()
        && this.dateWorked.getMonth() === other.dateWorked.getMonth()
        && this.dateWorked.getDate() === other.dateWorked.getDate()) {
        if (this.chargeNumber === other.chargeNumber) {
          return (this.extension < other.extension) ? -1 : 1;
        }
        return (this.chargeNumber < other.chargeNumber) ? -1 : 1;
      }
      return (this.dateWorked.getTime() < other.dateWorked.getTime()) ? -1 : 1;
    }
    return -1;
  }
}