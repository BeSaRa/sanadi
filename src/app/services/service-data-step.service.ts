import { Injectable } from '@angular/core';
import { ServiceDataStep } from '@app/models/service-data-step';
import { FactoryService } from '@app/services/factory.service';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@app/services/url.service';
import { DialogService } from '@app/services/dialog.service';
import { ComponentType } from '@angular/cdk/overlay';
import { ServiceDataStepInterceptor } from '@app/model-interceptors/service-data-step-interceptor';
import { Observable } from 'rxjs';
import {
  ServiceDataStepPopupComponent
} from '@app/administration/popups/service-data-step-popup/service-data-step-popup.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";

@CastResponseContainer({
  $default: {
    model: () => ServiceDataStep
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => ServiceDataStep }
  }
})
@Injectable({
  providedIn: 'root'
})
export class ServiceDataStepService extends CrudWithDialogGenericService<ServiceDataStep>{
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

  _getServiceURL(): string {
    return this.urlService.URLS.SERVICE_DATA_STEP;
  }

  @CastResponse(undefined)
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
