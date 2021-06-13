import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, retry} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {CustomHttpErrorResponse} from '../models/custom-http-error-response';
import {AdminResult} from '../models/admin-result';
import {ExceptionHandlerService} from '../services/exception-handler.service';

@Injectable()
export class BackendExceptionHandlerInterceptor implements HttpInterceptor {
  constructor(private exceptionHandlerService: ExceptionHandlerService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        const resError = Object.assign(new CustomHttpErrorResponse, error) as CustomHttpErrorResponse;
        resError.error.eo = AdminResult.createInstance(resError.error.eo);
        this.exceptionHandlerService.handle(error);
        return throwError(resError);
      })
    );
  }
}
