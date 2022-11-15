import {ComponentType} from '@angular/cdk/portal';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {
  FollowupConfigurationPopupComponent
} from '@app/administration/popups/followup-configuration-popup/followup-configuration-popup.component';
import {FollowupConfiguration} from '@app/models/followup-configuration';
import {DialogService} from './dialog.service';
import {FactoryService} from './factory.service';
import {UrlService} from './url.service';
import {Observable, of} from 'rxjs';
import {IFollowupCriteria} from '@app/interfaces/ifollowup-criteria';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {switchMap} from 'rxjs/operators';
import {CrudWithDialogGenericService} from '@app/generics/crud-with-dialog-generic-service';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {Pagination} from '@app/models/pagination';

@CastResponseContainer({
  $default: {
    model: () => FollowupConfiguration
  },
  $pagination: {
    model: () => Pagination,
    shape: {'rs.*': () => FollowupConfiguration}
  }
})

@Injectable({
  providedIn: 'root',
})
export class FollowupConfigurationService extends CrudWithDialogGenericService<FollowupConfiguration> {
  list: FollowupConfiguration[] = [];

  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService,
  ) {
    super();
    FactoryService.registerService('FollowupConfigurationService', this);

  }

  _getDialogComponent(): ComponentType<any> {
    return FollowupConfigurationPopupComponent;
  }

  _getModel() {
    return FollowupConfiguration;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.FOLLOWUP_CONFIGURATION;
  }

  getByCaseType(caseTypeId: number): Observable<FollowupConfiguration[]> {
    return this.getByCriteria({'case-type': caseTypeId});
  }

  @CastResponse(undefined)
  getByCriteria(criteria: Partial<IFollowupCriteria>): Observable<FollowupConfiguration[]> {
    return this.http.get<FollowupConfiguration[]>(this._getServiceURL() + '/criteria', {
      params: new HttpParams({fromObject: criteria})
    });
  }

  openCreateDialog(serviceId: number, caseType: number): DialogRef | Observable<DialogRef> {
    return this.dialog.show<IDialogData<FollowupConfiguration>>(this._getDialogComponent(), {
      operation: OperationTypes.CREATE,
      model: new FollowupConfiguration().clone({serviceId: serviceId, caseType: caseType})
    });
  }

  editDialogComposite(model: FollowupConfiguration): Observable<DialogRef> {
    return this._openUpdateDialog(model, true);
  }

  editDialog(model: FollowupConfiguration): Observable<DialogRef> {
    return this._openUpdateDialog(model, false);
  }

  private _openUpdateDialog(model: FollowupConfiguration, isCompositeLoad: boolean): Observable<DialogRef> {
    let request = isCompositeLoad ? this.getByIdComposite(model.id) : this.getById(model.id);
    return request.pipe(
      switchMap((result: FollowupConfiguration) => {
        return of(this.dialog.show<IDialogData<FollowupConfiguration>>(FollowupConfigurationPopupComponent, {
          model: result,
          operation: OperationTypes.UPDATE
        }));
      })
    );
  }

  openViewDialog(id: number): Observable<DialogRef> {
    return this.getById(id).pipe(
      switchMap((result: FollowupConfiguration) => {
        return of(this.dialog.show<IDialogData<FollowupConfiguration>>(FollowupConfigurationPopupComponent, {
          model: result,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }

  updateStatus(id: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(id) : this._deactivate(id);
  }

  @CastResponse('')
  private _activate(followUpConfigurationId: number): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/' + followUpConfigurationId + '/activate', null);
  }

  @CastResponse('')
  private _deactivate(followUpConfigurationId: number): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/' + followUpConfigurationId + '/de-activate', null);
  }

}

