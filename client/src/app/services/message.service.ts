import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MessageRequest, NotificationAck, NotificationResponse } from '../models/web/internalWeb';
import { Observable, map } from 'rxjs';
import { CacheService } from './cache.service';
import { INotification, Notification } from '../models/employees/notification';
import { EmployeeService } from './employee.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService  extends CacheService {
  showAlerts: boolean = false;
  interval: any;

  constructor(
    protected httpClient: HttpClient,
    protected empService: EmployeeService,
    protected authService: AuthService
  ) 
  { 
    super();
    const msgs = this.getMessages();
    this.showAlerts = (msgs && msgs.length > 0);
  }

  setMessages(msgs: INotification[]) {
    this.setItem('current-alerts', msgs);
  }

  clearMessages() {
    this.removeItem('current-alerts');
    this.showAlerts = false;
    if (this.interval && this.interval !== null) {
      clearInterval(this.interval)
    }
  }

  getMessages(): Notification[] {
    let msgs: Notification[] = [];
    const ialerts = this.getItem<INotification[]>('current-alerts');
    if (ialerts) {
      ialerts.forEach(alert => {
        msgs.push(new Notification(alert));
      });
      msgs.sort((a,b) => a.compareTo(b));
    }
    return msgs;
  }

  startAlerts() {
    const minutes = 1;
    if (this.interval && this.interval !== null) {
      clearInterval(this.interval)
    }
    this.interval = setInterval(() => {
      this.updateMessages()
    }, minutes * 60 * 1000);
  }

  updateMessages() {
    const iEmp = this.empService.getEmployee();
    if (iEmp && this.authService.isAuthenticated) {
      this.getEmployeeMessages(iEmp.id).subscribe({
        next: (data: NotificationResponse) => {
          if (data && data !== null && data.messages) {
            this.setMessages(data.messages)
            this.showAlerts = data.messages.length > 0;
          } else {
            this.clearMessages();
          }
        },
        error: err => {
          this.authService.statusMessage = "Error retrieving alerts: "
            + err.exception;
        }
      })
    }
  }

  createMessage(to: string, from: string, message: string): 
    Observable<NotificationResponse> {
    const url = '/api/v2/scheduler/messages';
    const data: MessageRequest = {
      to: to,
      from: from,
      message: message,
    };
    return this.httpClient.post<NotificationResponse>(url, data).pipe(
      map((data: NotificationResponse) => {
        if (data && data.exception === '' && data.messages) {
          this.showAlerts = (data.messages.length > 0);
          if (data.messages) {
            this.setMessages(data.messages);
          }
        }
        return data;
      })
    );
  }

  getMessage(id: string): Observable<NotificationResponse> {
    const url = `/api/v2/scheduler/messages/message/${id}`;
    return this.httpClient.get<NotificationResponse>(url);
  }

  getEmployeeMessages(id: string): Observable<NotificationResponse> {
    const url = `/api/v2/scheduler/messages/employee/${id}`;
    return this.httpClient.get<NotificationResponse>(url).pipe(
      map((data: NotificationResponse) => {
        if (data && data.exception === '' && data.messages) {
          this.showAlerts = (data.messages.length > 0);
          if (data.messages) {
            this.setMessages(data.messages);
          }
        }
        return data;
      })
    );
  }

  acknowledgeMessages(ids: string[]): Observable<NotificationResponse> {
    const url = `/api/v2/scheduler/messages/acknowledge`;
    const data: NotificationAck = {
      messages: ids,
    }
    return this.httpClient.put<NotificationResponse>(url, data).pipe(
      map((data: NotificationResponse) => {
        if (data && data.exception === '' && data.messages) {
          this.showAlerts = (data.messages.length > 0);
          if (data.messages) {
            this.setMessages(data.messages);
          }
        }
        return data;
      })
    );
  }
}
