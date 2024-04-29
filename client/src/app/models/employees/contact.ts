export interface IContact {
  id: number;
  typeid: number;
  sortid: number;
  value: string;
}

export class Contact implements IContact {
  id: number;
  typeid: number;
  sortid: number;
  value: string;

  constructor(other?: IContact) {
    this.id = (other) ? other.id : 0;
    this.typeid = (other) ? other.typeid : 0;
    this.sortid = (other) ? other.sortid : 0;
    this.value = (other) ? other.value : '';
  }

  compareTo(other: Contact): number {
    return (this.sortid < other.sortid) ? -1 : 1;
  }
}

export interface ISpecialty {
  id: number;
  specialtyid: number;
  sort: number;
  qualified: boolean;
}

export class Specialty implements ISpecialty {
  id: number;
  specialtyid: number;
  sort: number;
  qualified: boolean;

  constructor(other: ISpecialty) {
    this.id = (other) ? other.id : 0;
    this.specialtyid = (other) ? other.specialtyid : 0;
    this.sort = (other) ? other.sort : 0;
    this.qualified = (other) ? other.qualified : false;
  }

  compareTo(other: Specialty): number {
    return (this.sort < other.sort) ? -1 : 1;
  }
}