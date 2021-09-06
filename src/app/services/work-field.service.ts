import { Injectable } from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {WorkField} from '@app/models/work-field';
import {ComponentType} from '@angular/cdk/portal';
import {WorkFieldPopupComponent} from '@app/administration/popups/work-field-popup/work-field-popup.component';
import {FactoryService} from '@app/services/factory.service';
import {WorkFieldInterceptor} from '@app/model-interceptors/work-field-interceptor';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@app/services/url.service';
import {DialogService} from '@app/services/dialog.service';

@Injectable({
  providedIn: 'root'
})
export class WorkFieldService extends BackendWithDialogOperationsGenericService<WorkField>{
  list: WorkField[] = [];
  interceptor: WorkFieldInterceptor = new WorkFieldInterceptor();
  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('WorkFieldService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return WorkFieldPopupComponent;
  }

  _getModel(): any {
    return WorkField;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.WORK_FIELD;
  }
}
