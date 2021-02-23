import {Injectable} from '@angular/core';
import {DialogService} from './dialog.service';
import {HttpErrorResponse} from '@angular/common/http';
import {AdminResult} from '../models/admin-result';

@Injectable({
  providedIn: 'root'
})
export class ExceptionHandlerService {

  constructor(private dialogService: DialogService) {
  }

  handle(error: HttpErrorResponse): void {
    error.error.eo = AdminResult.createInstance(error.error.eo);
    // for now we will log it to console but later we will agreed with backend-team about the errorHandler for each code.
    this.dialogService.error(error.error.eo.getName() ? error.error.eo.getName() : (error.error.ec + ' : ' + error.error.ms));
  }
}
