import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, throwError as observableThrowError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AuthService } from "./auth.service";
import { AuthenticationResponse } from "../models/web/employeeWeb";
import { ExceptionResponse } from "../models/web/userWeb";
import { DialogService } from "./dialog-service.service";

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {

    constructor(
        private authService: AuthService,
        private router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): 
        Observable<HttpEvent<any>> {
        const jwt = this.authService.getToken()
        const authRequest = req.clone(
            { setHeaders: { authorization: `${jwt}`}})
        return next.handle(authRequest).pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401 
                    && (this.router.routerState.snapshot.url.indexOf('login') < 0
                    && this.router.routerState.snapshot.url.indexOf('home') < 0)) {
                    this.router.navigate(['/home'], {
                        queryParams: { 
                            redirectUrl: this.router.routerState.snapshot.url },
                    })
                }
                console.log(err);
                if (err.error.token || (err.error.token === '' 
                    && err.error.exception !== '')) {
                    const error: AuthenticationResponse = {
                        token: err.error.token,
                        exception: err.error.exception,
                        user: err.error.user,
                    }
                    return observableThrowError(() => error);
                } else if (err.error.exception && err.error.exception !== '') {
                    const error: ExceptionResponse = {
                        exception: err.error.exception,
                    }
                    return observableThrowError(() => error);
                }
                let message = "";
                // need to transform HTML error messages to JSON type by extracting only the
                // body of the message without any other markup.
                if (err.error.exception) {
                    message = err.error.exception;
                } else if (typeof(err.error) ===  'string') {
                    if (err.error.indexOf('<body>') >= 0) {
                    let spos = err.error.indexOf('<body>') + 6;
                    let epos = err.error.indexOf('</body>');
                    message = err.error.substring(spos, epos).trim();
                    if (message.indexOf('<pre>') >= 0) {
                        spos = message.indexOf('<pre>') + 5;
                        epos = message.indexOf('</pre>');
                        message = message.substring(spos, epos);
                    }
                    }
                } else {
                    message = err.error;
                }
                if (message !== '') {
                    if (err.status === 0) {
                    message = `Client Error: ${message}`;
                    } else {
                    message = `Server Error: Code: ${err.status} - ${message}`;
                    }
                }
                return observableThrowError(() => new Error(message));
            })
        )
    }
}