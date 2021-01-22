import {Injectable} from '@angular/core';
import {DialogService} from './dialog.service';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExceptionHandlerService {

  constructor(private dialogService: DialogService) {
  }

  handle(error: HttpErrorResponse): void {
    // for now we will log it to console but later we will agreed with backend-team about the errorHandler for each code.
    this.dialogService.error(error.error.ec + ' : ' + error.error.ms)
  }
}
