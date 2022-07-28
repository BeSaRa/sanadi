import {Injectable} from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {ServiceDataStep} from '@app/models/service-data-step';
import {FactoryService} from '@app/services/factory.service';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@app/services/url.service';
import {DialogService} from '@app/services/dialog.service';
import {ComponentType} from '@angular/cdk/overlay';
import {ServiceDataStepInterceptor} from '@app/model-interceptors/service-data-step-interceptor';
import {Generator} from '@app/decorators/generator';
import {Observable} from 'rxjs';
import {ServiceDataStepPopupComponent} from '@app/administration/popups/service-data-step-popup/service-data-step-popup.component';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {OperationTypes} from '@app/enums/operation-types.enum';

@Injectable({
  providedIn: 'root'
})
export class ServiceDataStepService extends BackendWithDialogOperationsGenericService<ServiceDataStep>{
  list: ServiceDataStep[] = [];
  interceptor: ServiceDataStepInterceptor = new ServiceDataStepInterceptor();

  constructor(public http: HttpClient, private urlService: UrlService, public dialog: DialogService) {
    super();
    FactoryService.registerService('ServiceDataStepService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return ServiceDataStepPopupComponent;
  }

  _getModel(): any {
    return ServiceDataStep;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SERVICE_DATA_STEP;
  }

  @Generator(undefined, true, {property: 'rs'})
  stepsByServiceId(serviceId: number): Observable<ServiceDataStep[]> {
    return this.http.get<ServiceDataStep[]>(this._getServiceURL() + '/service/' + serviceId);
  }

  openEditStepDialog(serviceDataStep: ServiceDataStep): DialogRef {
    return this.dialog.show<IDialogData<ServiceDataStep>>(ServiceDataStepPopupComponent, {
      model: serviceDataStep,
      operation: OperationTypes.UPDATE
    });
  }

  openViewStepDialog(serviceDataStep: ServiceDataStep): DialogRef {
    return this.dialog.show<IDialogData<ServiceDataStep>>(ServiceDataStepPopupComponent, {
      model: serviceDataStep,
      operation: OperationTypes.VIEW
    });
  }
}
