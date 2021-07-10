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

  handle(error: HttpErrorResponse): void {
    // if (error.status === 401) {
    //   return;
    // }
    error.error.eo = AdminResult.createInstance(error.error.eo);
    // do not handle the exception came from this url
    if (this.excludedUrls.has(error.url!)) {
      return;
    }
    // for now we will log it to console but later we will agreed with backend-team about the errorHandler for each code.
    this.dialog.error(error.error.eo.getName() ? (error.error.ec + '<br />' + error.error.eo.getName()) : (error.error.ec + '<br />' + error.error.ms));
  }

  excludeHandlingForURL(url: string): void {
    this.excludedUrls.set(url, url);
  }

  excludeHandlingForCode(code: number): void {
    this.excludedCodes.set(code, code);
  }
}
