import { supportsPassiveEventListeners } from "@angular/cdk/platform";
import { IVariation, Variation } from "../employees/assignments";
import { Employee, IEmployee } from "../employees/employee";
import { HttpErrorResponse } from "@angular/common/http";
import { throwError } from "rxjs";
import { ILogEntry, LogEntry } from "../logs/logentry";
import { INotification } from "../employees/notification";

export class WebEmployeeVariation {
  employee: Employee;
  variation: Variation;

  constructor(emp: IEmployee, vari: IVariation) {
    this.employee = new Employee(emp);
    this.variation = new Variation(vari);
  }

  compareTo(other?: WebEmployeeVariation): number {
    if (other) {
      if (this.variation.startdate.getTime() === other.variation.startdate.getTime()) {
        if (this.variation.enddate.getTime() === other.variation.enddate.getTime()) {
          return this.employee.compareTo(other.employee);
        }
        return (this.variation.enddate.getTime() 
          < other.variation.enddate.getTime()) ? -1 : 1;
      }
      return (this.variation.startdate.getTime() 
        < other.variation.startdate.getTime()) ? -1 : 1;
    }
    return -1;
  }
}

export class IngestManualChange {
  employeeid: string;
  changedate: Date;
  changevalue: string;

  constructor(id: string, date: Date, value: string) {
    this.employeeid = id;
    this.changedate = new Date(date);
    this.changevalue = value;
  }
}

export function handleError(error: HttpErrorResponse) {
  let message = "";
  // need to transform HTML error messages to JSON type by extracting only the
  // body of the message without any other markup.
  if (error.error.exception) {
    message = error.error.exception;
  } else if (typeof(error.error) ===  'string') {
    if (error.error.indexOf('<body>') >= 0) {
      let spos = error.error.indexOf('<body>') + 6;
      let epos = error.error.indexOf('</body>');
      message = error.error.substring(spos, epos).trim();
      if (message.indexOf('<pre>') >= 0) {
        spos = message.indexOf('<pre>') + 5;
        epos = message.indexOf('</pre>');
        message = message.substring(spos, epos);
      }
    }
  } else {
    message = error.error;
  }
  if (message !== '') {
    if (error.status === 0) {
      message = `Client Error: ${message}`;
    } else {
      message = `Server Error: Code: ${error.status} - ${message}`;
    }
  }
  return throwError(() => new Error(message));
}

export interface MessageRequest {
  to: string;
  from: string;
  message: string;
}

export interface NotificationAck {
  messages: string[];
}

export interface NotificationResponse {
  messages?: INotification[];
  exception?: string;
}

export interface AddLogEntry {
  portion: string;
  category: string;
  title: string;
  message: string;
}

export interface ILogResponse {
  entries: ILogEntry[];
  exception: string;
}

export class LogResponse {
  entries: LogEntry[];
  exception: string;

  constructor(resp?: ILogResponse) {
    this.entries = [];
    if (resp && resp.entries) {
      resp.entries.forEach(entry => {
        this.entries.push(new LogEntry(entry));
      });
      this.entries.sort((a,b) => a.compareTo(b));
    }
    this.exception = (resp) ? resp.exception : "";
  }
}