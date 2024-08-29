import { ComponentType } from "@angular/cdk/portal";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { RiskLevelDeterminationLogPopupComponent } from "@app/administration/popups/risk-level-determination-log-popup/risk-level-determination-log-popup.component";
import { RiskLevelDeterminationPopupComponent } from "@app/administration/popups/risk-level-determination-popup/risk-level-determination-popup.component";
import { PaginationContract } from "@app/contracts/pagination-contract";
import { CastResponse, CastResponseContainer } from "@app/decorators/decorators/cast-response";
import { HasInterception, InterceptParam } from "@app/decorators/decorators/intercept-model";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { IDialogData } from "@app/interfaces/i-dialog-data";
import { Pagination } from "@app/models/pagination";
import { RiskLevelDetermination } from "@app/models/risk-level-determination";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { Observable, of, switchMap, tap } from "rxjs";
import { DialogService } from "./dialog.service";
import { EmployeeService } from "./employee.service";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";
import { PermissionsEnum } from "@app/enums/permissions-enum";
import { RiskLevelDeterminationRequestStatusEnum } from "@app/enums/risk-level-determination-request-status-enumts";

@CastResponseContainer({
  $default: {
    model: () => RiskLevelDetermination
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => RiskLevelDetermination }
  }
})
@Injectable({
  providedIn: 'root'
})
export class RiskLevelDeterminationService extends CrudWithDialogGenericService<RiskLevelDetermination> {
  list: RiskLevelDetermination[] = [];

  constructor(public http: HttpClient,
    private urlService: UrlService,
    public dialog: DialogService) {
    super();
    FactoryService.registerService('RiskLevelDeterminationService', this);
  }

  _getModel(): new () => RiskLevelDetermination {
    return RiskLevelDetermination;
  }

  _getDialogComponent(): ComponentType<any> {
    return RiskLevelDeterminationPopupComponent;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.RISK_LEVEL_DETERMINATION;
  }

  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((RiskLevelDetermination: RiskLevelDetermination) => {
        return of(this.dialog.show<IDialogData<RiskLevelDetermination>>(RiskLevelDeterminationPopupComponent, {
          model: RiskLevelDetermination,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }

  @HasInterception
  @CastResponse(undefined)
  add(@InterceptParam() model: RiskLevelDetermination): Observable<RiskLevelDetermination> {
    return this.http.post<RiskLevelDetermination>(this._getServiceURL() + '', model);
  }
  approve(id: number) {
    return this.http.put<any>(this._getServiceURL() + '/request/' + id + '/approve', {});
  }
  reject(id: number) {
    return this.http.put<any>(this._getServiceURL() + '/request/' + id + '/reject', {});
  }
  approveBulk(ids: number[]) {
    return this.http.put<any>(this._getServiceURL() + '/request/approve/bulk', ids);
  }
  rejectBulk(ids: number[]) {
    return this.http.put<any>(this._getServiceURL() + '/request/reject/bulk', ids);
  }
  return(requestId: number, comment: string) {
    return this.http.put<any>(this._getServiceURL() + '/request/return', {
      requestId,
      comment
    });
  }
  acknowledge(id: number) {
    return this.http.put<any>(this._getServiceURL() + '/request/' + id + '/acknowledge', {});
  }
  acknowledgeBulk(ids: number[]) {
    return this.http.put<any>(this._getServiceURL() + '/request/acknowledge/bulk', ids);
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  getByRequestStatus(requestStatus: number) {
    return this.http.get<RiskLevelDetermination[]>(this._getServiceURL() + '/request/request-status/' + requestStatus)
  }
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  getAudits(id: number): Observable<RiskLevelDetermination[]> {
    return this.http.get<RiskLevelDetermination[]>(this._getServiceURL() + '/request/request-audit/' + id)
  }
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  getCountryAudits(countryId: number): Observable<RiskLevelDetermination[]> {
    return this.http.get<RiskLevelDetermination[]>(this._getServiceURL() + '/request/request-audit/' + countryId+'/approved')
  }
  openAuditLogsDialog(id: number): Observable<DialogRef> {
    return this.getAudits(id)
      .pipe(
        switchMap((logList: RiskLevelDetermination[]) => {
          return of(this.dialog.show(RiskLevelDeterminationLogPopupComponent, {
            logList
          }));
        })
      );
  }
  openCountryAuditLogsDialog(countryId: number): Observable<DialogRef> {
    return this.getCountryAudits(countryId)
      .pipe(
        switchMap((logList: RiskLevelDetermination[]) => {
          return of(this.dialog.show(RiskLevelDeterminationLogPopupComponent, {
            logList
          }));
        })
      );
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  getByStatuses(options: Partial<PaginationContract>,requestStatus:RiskLevelDeterminationRequestStatusEnum[]): Observable<Pagination<RiskLevelDetermination[]>> {
    return this.http.post<Pagination<RiskLevelDetermination[]>>(this._getServiceURL() + '/request/request-status/pg',{
      requestStatus
    }, {
      params: { ...options },
  
    }).pipe(
      tap(result => this.list = result.rs),
      tap(result => this._loadDone$.next(result.rs))
        
      // )
    );
  }

}
