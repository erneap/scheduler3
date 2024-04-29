import { HttpErrorResponse } from "@angular/common/http";
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { fromEventPattern, throwError } from "rxjs";

export function transformError(error: HttpErrorResponse | string) {
    let errorMessage = 'An unknown error has occured';
    if (typeof error === 'string') {
        errorMessage = error;
    } else if (error.error instanceof ErrorEvent) {
        errorMessage = `Error! ${error.error.message}`;
    } else if (typeof error.error === "string") {
        var msg = JSON.parse(error.error);
        errorMessage = msg.message;
    } else if (error.status) {
        errorMessage = `Request failed with ${error.status} ${error.statusText}`;
    }
    return throwError(errorMessage);
}

export function transformErrorString(error: HttpErrorResponse | string): string {
    let errorMessage = 'An unknown error has occured';
    if (typeof error === 'string') {
        errorMessage = error;
    } else if (error.error instanceof ErrorEvent) {
        errorMessage = `Error! ${error.error.message}`;
    } else if (typeof error.error === "string") {
        var msg = JSON.parse(error.error);
        errorMessage = msg.message;
    } else if (error.status) {
        errorMessage = `Request failed with ${error.status} ${error.statusText}`;
    }
    return errorMessage
}