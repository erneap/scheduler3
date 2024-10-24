import { ILogEntry, LogEntry } from "./logentry";

export class AppList {
    list: string[] = [];
    exception: string = "";
}

export interface ILogList {
    list: ILogEntry[];
    exception: string;
}

export class LogList implements ILogList {
    list: LogEntry[];
    exception: string;

    constructor(loglist?: ILogList) {
        this.list = [];
        if (loglist && loglist.list.length > 0) {
            loglist.list.forEach(le => {
                this.list.push(new LogEntry(le));
            });
        }
        this.list.sort((a,b) => b.compareTo(a));
        this.exception = (loglist) ? loglist.exception : "";
    }
}