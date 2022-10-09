import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuditLog } from '../models/audit-log';
import { isValidValue } from '@helpers/utils';
import { FactoryService } from './factory.service';
import { HttpClient } from '@angular/common/http';
import { AuditLogInterceptor } from '../model-interceptors/audit-log-interceptor';
import { DialogService } from './dialog.service';
import { switchMap } from 'rxjs/operators';
import { AuditLogPopupComponent } from '../administration/popups/audit-log-popup/audit-log-popup.component';
import { DialogRef } from '../shared/models/dialog-ref';
import { CastResponse } from "@decorators/cast-response";

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  interceptor = new AuditLogInterceptor();
  constructor(public http: HttpClient,
              private dialogService: DialogService) {
    FactoryService.registerService('AuditLogService', this);
  }

  @CastResponse(()=> AuditLog)
  private _loadAuditLogsById(id: number, baseUrl: string): Observable<AuditLog[]> {
    if (!isValidValue(id)) {
      return of([]);
    }
    return this.http.get<AuditLog[]>(baseUrl + '/audit/' + id);
  }

  loadAuditLogsById(id: number, baseUrl: string): Observable<AuditLog[]> {
    return this._loadAuditLogsById(id, baseUrl);
  }

  openAuditLogsDialog(id: number, baseUrl: string): Observable<DialogRef> {
    return this.loadAuditLogsById(id, baseUrl)
      .pipe(
        switchMap((logList: AuditLog[]) => {
          return of(this.dialogService.show(AuditLogPopupComponent, {
            logList
          }));
        })
      );
  }

  _getModel(): any {
    return AuditLog;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }
}
