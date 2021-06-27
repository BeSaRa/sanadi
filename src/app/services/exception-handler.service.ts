import {Injectable} from '@angular/core';
import {DialogService} from './dialog.service';
import {HttpErrorResponse} from '@angular/common/http';
import {AdminResult} from '../models/admin-result';

@Injectable({
  providedIn: 'root'
})
export class ExceptionHandlerService {

  constructor(private dialog: DialogService) {
  }

  handle(error: HttpErrorResponse): void {
    // if (error.status === 401) {
    //   return;
    // }
    error.error.eo = AdminResult.createInstance(error.error.eo);
    // for now we will log it to console but later we will agreed with backend-team about the errorHandler for each code.
    this.dialog.error(error.error.eo.getName() ? (error.error.ec + '<br />' + error.error.eo.getName()) : (error.error.ec + '<br />' + error.error.ms));
  }
}
