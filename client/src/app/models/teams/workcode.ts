export interface IWorkcode {
  id: string;
  title: string;
  start: number;
  shiftCode: number;
  altcode: string;
  search: string;
  isLeave: boolean;
  textcolor: string;
  backcolor: string;
}

export class Workcode implements IWorkcode {
  id: string;
  title: string;
  start: number;
  shiftCode: number;
  altcode: string;
  search: string;
  isLeave: boolean;
  textcolor: string;
  backcolor: string;

  constructor(wc?: IWorkcode) {
    this.id = (wc) ? wc.id : '';
    this.title = (wc) ? wc.title : '';
    this.start = (wc) ? wc.start : 0;
    this.shiftCode = (wc) ? wc.shiftCode : 1;
    this.altcode = (wc) ? wc.altcode : '';
    this.search = (wc) ? wc.search : '';
    this.isLeave = (wc) ? wc.isLeave : false;
    this.textcolor = (wc) ? wc.textcolor : '000000';
    this.backcolor = (wc) ? wc.backcolor : 'ffffff';
  }

  compareTo(other?: Workcode): number {
    if (other) {
      if (this.isLeave === other.isLeave) {
        return (this.id < other.id) ? -1 : 1;
      }
      return (this.isLeave && !other.isLeave) ? 1 : -1;
    }
    return -1;
  }
}