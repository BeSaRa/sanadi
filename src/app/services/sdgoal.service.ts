import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SDGoal} from '@app/models/sdgoal';
import {FactoryService} from '@app/services/factory.service';
import {UrlService} from '@app/services/url.service';
import {ComponentType} from '@angular/cdk/portal';
import {SdGoalPopupComponent} from '@app/administration/popups/sd-goal-popup/sd-goal-popup.component';
import {DialogService} from '@app/services/dialog.service';
import {SdGoalInterceptor} from '@app/model-interceptors/sd-goal-interceptor';
import {Observable, of} from 'rxjs';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {CrudWithDialogGenericService} from '@app/generics/crud-with-dialog-generic-service';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {Pagination} from '@app/models/pagination';
import {PaginationContract} from '@contracts/pagination-contract';
import {catchError, switchMap} from 'rxjs/operators';

@CastResponseContainer({
  $default: {
    model: () => SDGoal
  },
  $pagination: {
    model: () => Pagination,
    shape: {'rs.*': () => SDGoal}
  }
})
@Injectable({
  providedIn: 'root'
})
export class SDGoalService extends CrudWithDialogGenericService<SDGoal> {
  list: SDGoal[] = [];
  interceptor: SdGoalInterceptor = new SdGoalInterceptor();

  _getDialogComponent(): ComponentType<any> {
    return SdGoalPopupComponent;
  }

  _getModel() {
    return SDGoal;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SD_GOAL;
  }

  constructor(public http: HttpClient, private urlService: UrlService, public dialog: DialogService) {
    super();
    FactoryService.registerService('SDGoalService', this);
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  loadMainSdGoals(): Observable<SDGoal[]> {
    return this.http.get<SDGoal[]>(this._getServiceURL() + '/main')
      .pipe(catchError(() => of([])));
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  loadMainSdGoalsPaginate(options: Partial<PaginationContract>): Observable<Pagination<SDGoal[]>> {
    return this.http.get<Pagination<SDGoal[]>>(this._getServiceURL() + '/main', {
      params: {...options}
    }).pipe(
      catchError(() => of(this._emptyPaginationListResponse))
    );
  }

  @CastResponse(undefined)
  loadSubSdGoals(sdGoalId: number): Observable<SDGoal[]> {
    return this.http.get<SDGoal[]>(this._getServiceURL() + '/sub/' + sdGoalId)
      .pipe(catchError(() => of([])));
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  loadSubSdGoalsPaginate(options: Partial<PaginationContract>, sdGoalId: number): Observable<Pagination<SDGoal[]>> {
    if (!sdGoalId) {
      return of(this._emptyPaginationListResponse);
    }
    return this.http.get<Pagination<SDGoal[]>>(this._getServiceURL() + '/sub/' + sdGoalId, {
      params: {...options}
    }).pipe(
      catchError(() => of(this._emptyPaginationListResponse))
    );
  }

  openCreateDialog(parentId?: number): DialogRef {
    return this.dialog.show<IDialogData<SDGoal>>(this._getDialogComponent(), {
      model: new SDGoal().clone({ parentId: parentId, status: CommonStatusEnum.ACTIVATED }),
      operation: OperationTypes.CREATE,
      selectedTab: 'basic'
    });
  }

  openUpdateDialog(modelId: number, selectedPopupTab: string = 'basic'): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((item: SDGoal) => {
        return of(this.dialog.show<IDialogData<SDGoal>>(this._getDialogComponent(), {
          model: item,
          operation: OperationTypes.UPDATE,
          selectedTab: selectedPopupTab || 'basic'
        }));
      })
    );
  }

  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((item: SDGoal) => {
        return of(this.dialog.show<IDialogData<SDGoal>>(this._getDialogComponent(), {
          model: item,
          operation: OperationTypes.VIEW,
          selectedTab: 'basic'
        }));
      })
    );
  }

  updateStatus(sdGoalId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(sdGoalId) : this._deactivate(sdGoalId);
  }

  private _activate(sdGoalId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + sdGoalId + '/activate', {});
  }

  private _deactivate(sdGoalId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + sdGoalId + '/de-activate', {});
  }
}
