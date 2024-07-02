import { Employee, IEmployee } from "../employees/employee";

export interface IShift {
  id: string;
  name: string;
  sort: number;
  associatedCodes?: string[];
  payCode?: number;
  minimums?: number;
}

export class Shift implements IShift {
  id: string;
  name: string;
  sort: number;
  associatedCodes?: string[];
  payCode?: number;
  minimums: number;
  employees?: Employee[];

  constructor(shft?: IShift) {
    this.id = (shft) ? shft.id : '';
    this.name = (shft) ? shft.name : '';
    this.sort = (shft) ? shft.sort : 0;
    this.payCode = (shft) ? shft.payCode : 1;
    this.minimums = (shft && shft.minimums) ? shft.minimums : 0;
    this.associatedCodes = [];
    if (shft && shft.associatedCodes) {
      shft.associatedCodes.forEach(ac => {
        this.associatedCodes?.push(ac);
      });
    }
  }

  compareTo(other?: Shift): number {
    if (other) {
      return (this.sort < other.sort) ? -1 : 1;
    }
    return -1;
  }

  addEmployee(emp: IEmployee) {
    if (!this.employees) {
      this.employees = [];
    }
    this.employees.push(new Employee(emp));
    this.employees.sort((a,b) => a.compareTo(b));
  }
}

export interface IPosition {
  id: string;
  name: string;
  sort: number;
  assigned: string[];
}

export class Position implements IPosition {
  id: string;
  name: string;
  sort: number;
  assigned: string[];
  employees?: Employee[];

  constructor(pos?: IPosition) {
    this.id = (pos) ? pos.id : '';
    this.name = (pos) ? pos.name : '';
    this.sort = (pos) ? pos.sort : 0;
    this.assigned = [];
    if (pos && pos.assigned && pos.assigned.length > 0) {
      pos.assigned.forEach(asgn => {
        this.assigned.push(asgn);
      });
    }
  }

  compareTo(other?: Position): number {
    if (other) {
      return (this.sort < other.sort) ? -1 : 1;
    }
    return -1;
  }

  addEmployee(emp: IEmployee) {
    if (!this.employees) {
      this.employees = [];
    }
    this.employees.push(new Employee(emp));
    this.employees.sort((a,b) => a.compareTo(b));
  }
}

export interface IWorkcenter {
  id: string;
  name: string;
  sort: number;
  shifts?: IShift[];
  positions?: IPosition[];
}

export class Workcenter implements IWorkcenter {
  id: string;
  name: string;
  sort: number;
  shifts?: Shift[];
  positions?: Position[];
  employees?: Employee[];

  constructor(wc?: IWorkcenter) {
    this.id = (wc) ? wc.id : '';
    this.name = (wc) ? wc.name : '';
    this.sort = (wc) ? wc.sort : 0;
    this.shifts = [];
    if (wc && wc.shifts && wc.shifts.length > 0) {
      wc.shifts.forEach(s => {
        this.shifts?.push(new Shift(s));
      });
      this.shifts?.sort((a,b) => a.compareTo(b))
    }
    this.positions = [];
    if (wc && wc.positions && wc.positions.length > 0) {
      wc.positions.forEach(pos => {
        this.positions?.push(new Position(pos));
      });
      this.positions.sort((a,b) => a.compareTo(b));
    }
  }

  compareTo(other?: Workcenter): number {
    if (other) {
      return (this.sort < other.sort) ? -1 : 1;
    }
    return -1;
  }

  clearEmployees() {
    if (this.positions) {
      this.positions.forEach(pos => {
        if (pos.employees) {
          pos.employees = [];
        }
      });
    }
    if (this.shifts) {
      this.shifts.forEach(pos => {
        if (pos.employees) {
          pos.employees = [];
        }
      });
    }
  }

  addEmployee(iEmp: IEmployee, month?: Date) {
    const emp = new Employee(iEmp);
    let found = false;
    if (this.positions  && this.positions.length > 0) {
      this.positions.forEach(pos => {
        pos.assigned.forEach(asgn => {
          if (asgn === emp.id) {
            pos.addEmployee(emp);
            found = true;
          }
        })
      });
    }
    if (!found) {
      if (!month) {
        month = new Date();
        month = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
      }
      const shiftMap = new Map<string, number>();
      let start = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
      while (start.getUTCMonth() === month.getUTCMonth()) {
        const wd = emp.getWorkdayWOLeaves(emp.site, start);
        if (this.shifts && this.shifts.length > 0) {
          this.shifts.forEach(sft => {
            if (sft.associatedCodes) {
              sft.associatedCodes.forEach(ac => {
                if (ac.toLowerCase() === wd.code.toLowerCase()) {
                  let cnt = shiftMap.get(sft.id);
                  if (cnt) {
                    cnt++;
                    shiftMap.set(sft.id, cnt);
                  } else {
                    shiftMap.set(sft.id, 1);
                  }
                }
              });
            }
          });
        }
        start = new Date(start.getTime() + (24 * 3600000));
      }
      let shftID = '';
      let count = 0;
      for (let key of shiftMap.keys()) {
        let cnt = shiftMap.get(key);
        if (cnt) {
          if (cnt > count) {
            count = cnt;
            shftID = key;
          }
        }
      }
      if (this.shifts) {
        this.shifts.forEach(sft => {
          if (sft.id.toLowerCase() === shftID.toLowerCase()) {
            sft.addEmployee(emp);
            found = true;
          }
        })
      }
    }
    if (!found) {
      if (!this.employees) {
        this.employees = [];
      }
      this.employees.push(emp)
    }
  }

  setWorkcenterStyles(): void {
    let count = 0;
    if (this.positions && this.positions.length > 0) {
      this.positions.forEach(pos => {
        if (pos.employees && pos.employees.length > 0) {
          pos.employees.forEach(emp => {
            count++;
            emp.even = (count % 2 === 0);
          });
        }
      });
    }
    if (this.shifts && this.shifts.length > 0) {
      this.shifts.forEach(shft => {
        if (shft.employees && shft.employees.length > 0) {
          shft.employees.forEach(emp => {
            count++;
            emp.even = (count % 2 === 0);
          });
        }
      });
    }
  }
}