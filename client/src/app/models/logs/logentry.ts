export interface ILogEntry {
  id: string;
  entrydate: Date;
  application: string
  category: string;
  title: string;
  message: string;
  name: string;
}

export class LogEntry implements ILogEntry {
  id: string;
  entrydate: Date;
  application: string;
  category: string;
  title: string;
  message: string;
  name: string;

  constructor(entry?: ILogEntry) {
    this.id = (entry) ? entry.id : "";
    this.entrydate = (entry) ? new Date(entry.entrydate) : new Date();
    this.application = (entry) ? entry.application : "";
    this.category = (entry) ? entry.category : "";
    this.title = (entry) ? entry.title : "";
    this.message = (entry) ? entry.message : "";
    this.name = (entry) ? entry.name : "";
  }

  compareTo(other?: LogEntry): number {
    if (other) {
      if (this.entrydate.getTime() === other.entrydate.getTime()) {
        if (this.application === other.application) {
          if (this.category === other.category) {
            if (this.title === other.title) {
              return this.message < other.message ? -1 : 1;
            }
            return this.title < other.title ? -1 : 1;
          }
          return this.category < other.category ? -1 : 1;
        }
        return this.application < other.application ? -1 : 1;
      }
      return this.entrydate.getTime() < other.entrydate.getTime() ? -1 : 1;
    }
    return -1;
  }
}