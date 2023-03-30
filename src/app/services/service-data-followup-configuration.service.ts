import {ComponentType} from '@angular/cdk/portal';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {
  ServiceDataFollowupConfigurationPopupComponent
} from '@app/administration/popups/service-data-followup-configuration-popup/service-data-followup-configuration-popup.component';
import {ServiceDataFollowupConfiguration} from '@models/service-data-followup-configuration';
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
    model: () => ServiceDataFollowupConfiguration
  },
  $pagination: {
    model: () => Pagination,
    shape: {'rs.*': () => ServiceDataFollowupConfiguration}
  }
})

@Injectable({
  providedIn: 'root',
})
export class ServiceDataFollowupConfigurationService extends CrudWithDialogGenericService<ServiceDataFollowupConfiguration> {
  list: ServiceDataFollowupConfiguration[] = [];

  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService,
  ) {
    super();
    FactoryService.registerService('ServiceDataFollowupConfigurationService', this);

  }

  _getDialogComponent(): ComponentType<any> {
    return ServiceDataFollowupConfigurationPopupComponent;
  }

  _getModel() {
    return ServiceDataFollowupConfiguration;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.FOLLOWUP_CONFIGURATION;
  }

  getByCaseType(caseTypeId: number): Observable<ServiceDataFollowupConfiguration[]> {
    return this.getByCriteria({'case-type': caseTypeId});
  }

  @CastResponse(undefined)
  getByCriteria(criteria: Partial<IFollowupCriteria>): Observable<ServiceDataFollowupConfiguration[]> {
    return this.http.get<ServiceDataFollowupConfiguration[]>(this._getServiceURL() + '/criteria', {
      params: new HttpParams({fromObject: criteria})
    });
  }

  openCreateDialog(serviceId: number, caseType: number): DialogRef | Observable<DialogRef> {
    return this.dialog.show<IDialogData<ServiceDataFollowupConfiguration>>(this._getDialogComponent(), {
      operation: OperationTypes.CREATE,
      model: new ServiceDataFollowupConfiguration().clone({serviceId: serviceId, caseType: caseType})
    });
  }

  editDialogComposite(model: ServiceDataFollowupConfiguration): Observable<DialogRef> {
    return this._openUpdateDialog(model, true);
  }

  editDialog(model: ServiceDataFollowupConfiguration): Observable<DialogRef> {
    return this._openUpdateDialog(model, false);
  }

  private _openUpdateDialog(model: ServiceDataFollowupConfiguration, isCompositeLoad: boolean): Observable<DialogRef> {
    let request = isCompositeLoad ? this.getByIdComposite(model.id) : this.getById(model.id);
    return request.pipe(
      switchMap((result: ServiceDataFollowupConfiguration) => {
        return of(this.dialog.show<IDialogData<ServiceDataFollowupConfiguration>>(ServiceDataFollowupConfigurationPopupComponent, {
          model: result,
          operation: OperationTypes.UPDATE
        }));
      })
    );
  }

  openViewDialog(id: number): Observable<DialogRef> {
    return this.getById(id).pipe(
      switchMap((result: ServiceDataFollowupConfiguration) => {
        return of(this.dialog.show<IDialogData<ServiceDataFollowupConfiguration>>(ServiceDataFollowupConfigurationPopupComponent, {
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

