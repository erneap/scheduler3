export interface INotification {
  id: string;
  date: Date;
  to: string;
  from: string;
  message: string;
  checked: boolean;
}

export class Notification implements INotification {
  id: string;
  date: Date;
  to: string;
  from: string;
  message: string;
  checked: boolean;

  constructor(note?: INotification) {
    this.id = (note) ? note.id : '';
    this.date = (note) ? new Date(note.date) : new Date();
    this.to = (note) ? note.to : '';
    this.from = (note) ? note.from : '';
    this.message = (note) ? note.message : '';
    this.checked = (note) ? note.checked : false;
  }

  compareTo(other?: Notification): number {
    if (other) {
      return (this.date.getTime() < other.date.getTime()) ? -1 : 1;
    }
    return -1;
  }
}