import {ErrorHandler, Injectable, NgZone} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {ExceptionHandlerService} from '../services/exception-handler.service';

@Injectable()
export class GeneralErrorHandler implements ErrorHandler {

  constructor(private exceptionHandlerService: ExceptionHandlerService, private zone: NgZone) {
  }

  handleError(error: Error | HttpErrorResponse): void {
    if (error instanceof HttpErrorResponse) {
      this.zone.run(() => {
        this.exceptionHandlerService.handle(error);
      });
    } else {
      error.message.indexOf("Cannot read property 'template' of null") === -1 ? console.log(error) : null;
    }
  }
}
