export interface ILogEntry {
  entrydate: Date;
  category: string;
  title: string;
  message: string;
  requestor: string;
}

export class LogEntry implements ILogEntry {
  entrydate: Date;
  category: string;
  title: string;
  message: string;
  requestor: string;

  constructor(entry?: ILogEntry) {
    this.entrydate = (entry) ? new Date(entry.entrydate) : new Date();
    this.category = (entry) ? entry.category : "";
    this.title = (entry) ? entry.title : "";
    this.message = (entry) ? entry.message : "";
    this.requestor = (entry) ? entry.requestor : "";
  }

  compareTo(other?: LogEntry): number {
    if (other) {
      if (this.entrydate.getTime() === other.entrydate.getTime()) {
        if (this.category === other.category) {
          if (this.title === other.title) {
            return this.message < other.message ? -1 : 1;
          }
          return this.title < other.title ? -1 : 1;
        }
        return this.category < other.category ? -1 : 1;
      }
      return this.entrydate.getTime() < other.entrydate.getTime() ? -1 : 1;
    }
    return -1;
  }
}