import {Injectable} from '@angular/core';
import {DialogService} from './dialog.service';
import {HttpErrorResponse} from '@angular/common/http';
import {AdminResult} from '../models/admin-result';

@Injectable({
  providedIn: 'root'
})
export class ExceptionHandlerService {
  private excludedUrls: Map<string, string> = new Map<string, string>();
  private excludedCodes: Map<number, number> = new Map<number, number>();

  constructor(private dialog: DialogService) {
  }

  handle(error: any): void {
    // if (error.status === 401) {
    //   return;
    // }
    if (!error.error) {
      error.error = {eo: error.eo}
    }

    if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 200)) {
      this.dialog.error('CHECK SERVICE URL <br />' + error.message);
      return;
    }
    error.error.eo = AdminResult.createInstance(error.error.eo);
    // do not handle the exception came from this url
    if (this.excludedUrls.has(error.url!)) {
      return;
    }
    /*const modelInterceptor = error.hasOwnProperty('message') && (error.message.indexOf('JSON') !== -1);
    // for now we will log it to console but later we will agreed with backend-team about the errorHandler for each code.
    this.dialog.error(error.error.eo.getName() ? ((modelInterceptor ? 'CHECK YOU MODEL INTERCEPTOR' : error.error.ec) + '<br />' + error.error.eo.getName()) : (error.error.ec + '<br />' + error.error.ms));*/
    this.dialog.error(error.error.eo.getName() ? (error.error.eo.getName()) : (error.error.ms));
  }

  // noinspection JSUnusedGlobalSymbols
  excludeHandlingForURL(url: string): void {
    this.excludedUrls.set(url, url);
  }

  // noinspection JSUnusedGlobalSymbols
  excludeHandlingForCode(code: number): void {
    this.excludedCodes.set(code, code);
  }
}
