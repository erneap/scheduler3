export interface IDBReport {
  id: string;
  reportdate: Date;
  reporttypeid: string;
  subtype?: string;
  mimetype: string;
  docbody?: string;
}

export class DBReport implements IDBReport {
  id: string;
  reportdate: Date;
  reporttypeid: string;
  subtype?: string;
  mimetype: string;
  docbody?: string;

  constructor(rpt?: IDBReport) {
    this.id = (rpt) ? rpt.id : "";
    this.reportdate = (rpt) ? new Date(rpt.reportdate) : new Date();
    this.reporttypeid = (rpt) ? rpt.reporttypeid : "";
    this.subtype = (rpt && rpt.subtype) ? rpt.subtype : "";
    this.mimetype = (rpt) ? rpt.mimetype : "";
    this.docbody = (rpt && rpt.docbody) ? rpt.docbody : "";
  }

  compareTo(other?: DBReport): number {
    if (other) {
      if (this.reporttypeid === other.reporttypeid) {
        return this.reportdate.getTime() - other.reportdate.getTime();
      }
      return (this.reporttypeid < other.reporttypeid) ? -1 : 1;
    }
    return -1;
  }
}

export interface IReportType {
  id: string;
  application: string;
  reporttype: string;
  name: string;
  subtypes?: string[];
  reports?: IDBReport[];
}

export class ReportType implements IReportType {
  id: string;
  application: string;
  reporttype: string;
  name: string;
  subtypes?: string[];
  reports?: IDBReport[];

  constructor(rType?: IReportType) {
    this.id = (rType) ? rType.id : "";
    this.application = (rType) ? rType.application : "";
    this.reporttype = (rType) ? rType.reporttype : "";
    this.name = (rType) ? rType.name : "";
    this.subtypes = [];
    if (rType && rType.subtypes) {
      rType.subtypes.forEach(stype => {
        if (this.subtypes) {
          this.subtypes.push(stype);
        }
      });
    }
    this.reports = [];
    if (rType && rType.reports) {
      rType.reports.forEach(rpt => {
        if (this.reports) {
          this.reports.push(new DBReport(rpt));
        }
      });
    }
  }

  compareTo(other?: ReportType): number {
    if (other) {
      if (this.application === other.application) {
        return (this.name < other.name) ? -1 : 1;
      }
      return (this.application < other.application) ? -1 : 1;
    }
    return -1;
  }
}

export interface IReportTypeList {
  reporttypes?: IReportType[];
  exception?: string;
}

export class ReportTypeList implements IReportTypeList {
  reporttypes: ReportType[];
  exception?: string;

  constructor(rtl?: IReportTypeList) {
    this.reporttypes = [];
    if (rtl && rtl.reporttypes) {
      rtl.reporttypes.forEach(rt => {
        this.reporttypes.push(new ReportType(rt));
      });
      this.reporttypes.sort((a,b) => b.compareTo(a))
    }
    this.exception = (rtl && rtl.exception) ? rtl.exception : undefined;
  }
}