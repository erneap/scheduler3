export interface ICompanyInfo {
  company: string;
  employeeid: string;
  alternateid: string;
  jobtitle: string;
  rank: string;
  costcenter: string;
  division: string;
}

export class CompanyInfo implements ICompanyInfo {
  company: string;
  employeeid: string;
  alternateid: string;
  jobtitle: string;
  rank: string;
  costcenter: string;
  division: string;

  constructor(ci?: ICompanyInfo) {
    this.company = (ci) ? ci.company : '';
    this.employeeid = (ci) ? ci.employeeid : '';
    this.alternateid = (ci) ? ci.alternateid : '';
    this.jobtitle = (ci) ? ci.jobtitle : '';
    this.rank = (ci) ? ci.rank : '';
    this.costcenter = (ci) ? ci.costcenter : '';
    this.division = (ci) ? ci.division : '';
  }
}