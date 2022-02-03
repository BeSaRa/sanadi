import { Injectable } from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {OrgUnitField} from '@app/models/org-unit-field';
import {FactoryService} from '@app/services/factory.service';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@app/services/url.service';
import {DialogService} from '@app/services/dialog.service';
import {OrgUnitFieldInterceptor} from '@app/model-interceptors/org-unit-field-interceptor';
import {ComponentType} from '@angular/cdk/overlay';
import {OrgUnitFieldPopupComponent} from '@app/administration/popups/org-unit-field-popup/org-unit-field-popup.component';

@Injectable({
  providedIn: 'root'
})
export class OrgUnitFieldService extends BackendWithDialogOperationsGenericService<OrgUnitField>{
  list: OrgUnitField[] = [];
  interceptor: OrgUnitFieldInterceptor = new OrgUnitFieldInterceptor();
  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('OrgUnitFieldService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return OrgUnitFieldPopupComponent;
  }

  _getModel(): any {
    return OrgUnitField;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ORG_UNIT_FIELD;
  }
}
