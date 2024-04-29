import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DialogService } from './dialog-service.service';
import { AuthHttpInterceptor } from './auth-http-interceptor';

@Injectable()
export class SpinInterceptorInterceptor implements HttpInterceptor {

  private totalRequests = 0;

  constructor(
    private dialogService: DialogService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.totalRequests++;
    this.dialogService.showSpinner();
    return next.handle(request).pipe(
      finalize(() => {
        this.totalRequests--;
        if (this.totalRequests <= 0) {
          this.dialogService.closeSpinner();
        }
      })
    );
  }
}

export const interceptorProviders =
  [
    { provide: HTTP_INTERCEPTORS, useClass: SpinInterceptorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
  ];

