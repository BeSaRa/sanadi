import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {AuditLog} from '@models/audit-log';
import {FactoryService} from './factory.service';
import {HttpClient} from '@angular/common/http';
import {DialogService} from './dialog.service';
import {switchMap} from 'rxjs/operators';
import {AdminAuditLogPopupComponent} from '../administration/popups/audit-log-popup/admin-audit-log-popup.component';
import {DialogRef} from '../shared/models/dialog-ref';
import {CastResponse} from "@decorators/cast-response";
import {CommonUtils} from "@helpers/common-utils";

@Injectable({
  providedIn: 'root'
})
export class AdminAuditLogService {
  constructor(public http: HttpClient,
              private dialogService: DialogService) {
    FactoryService.registerService('AdminAuditLogService', this);
  }

  @CastResponse(()=> AuditLog)
  loadAuditLogsById(id: number, baseUrl: string): Observable<AuditLog[]> {
    if (!CommonUtils.isValidValue(id)) {
      return of([]);
    }
    return this.http.get<AuditLog[]>(baseUrl + '/audit/' + id);
  }

  openAuditLogsDialog(id: number, baseUrl: string): Observable<DialogRef> {
    return this.loadAuditLogsById(id, baseUrl)
      .pipe(
        switchMap((logList: AuditLog[]) => {
          return of(this.dialogService.show(AdminAuditLogPopupComponent, {
            logList
          }));
        })
      );
  }
}
