export interface IType {
  id: number;
  name: string;
  sort: number;
}

export class ContactType implements IType {
  id: number;
  name: string;
  sort: number;

  constructor(itype?: IType) {
    this.id = (itype) ? itype.id : 0;
    this.name = (itype) ? itype.name : "";
    this.sort = (itype) ? itype.sort : 0;
  }

  compareTo(other?: ContactType): number {
    if (other) {
      return (this.sort < other.sort) ? -1 : 1;
    }
    return -1;
  }
}

export class SpecialtyType implements IType {
  id: number;
  name: string;
  sort: number;

  constructor(itype?: IType) {
    this.id = (itype) ? itype.id : 0;
    this.name = (itype) ? itype.name : "";
    this.sort = (itype) ? itype.sort : 0;
  }

  compareTo(other?: SpecialtyType): number {
    if (other) {
      return (this.sort < other.sort) ? -1 : 1;
    }
    return -1;
  }
}