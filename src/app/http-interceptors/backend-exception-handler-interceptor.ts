import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, retry} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {CustomHttpErrorResponse} from '@models/custom-http-error-response';
import {AdminResult} from '@models/admin-result';
import {ExceptionHandlerService} from '@services/exception-handler.service';
import {NOT_RETRY_TOKEN} from "@app/http-context/tokens";

@Injectable()
export class BackendExceptionHandlerInterceptor implements HttpInterceptor {
  constructor(private exceptionHandlerService: ExceptionHandlerService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const withTry$ = next.handle(req).pipe(retry(1))
    const withoutTry$ = next.handle(req)
    const next$ = req.context.get(NOT_RETRY_TOKEN) ? withoutTry$ : withTry$;
    return next$.pipe(
      catchError((error: HttpErrorResponse) => {
        const resError = Object.assign(new CustomHttpErrorResponse, {error: error}) as CustomHttpErrorResponse;
        resError.error.eo = AdminResult.createInstance(resError.error.hasOwnProperty('eo') ? resError.error.eo : {
          arName: resError.error as unknown as string,
          enName: resError.error as unknown as string
        });
        this.exceptionHandlerService.handle(error, req);
        return throwError(resError);
      })
    );
  }
}
