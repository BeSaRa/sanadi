import { Injectable } from '@angular/core';
import { OrgUnitField } from '@app/models/org-unit-field';
import { FactoryService } from '@app/services/factory.service';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@app/services/url.service';
import { DialogService } from '@app/services/dialog.service';
import { OrgUnitFieldInterceptor } from '@app/model-interceptors/org-unit-field-interceptor';
import { ComponentType } from '@angular/cdk/overlay';
import {
  OrgUnitFieldPopupComponent
} from '@app/administration/popups/org-unit-field-popup/org-unit-field-popup.component';
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: {
    model: () => OrgUnitField
  },
  $pagination: {
    model: () => OrgUnitField,
    shape: { 'rs.*': () => OrgUnitField }
  }
})
@Injectable({
  providedIn: 'root'
})
export class OrgUnitFieldService extends CrudWithDialogGenericService<OrgUnitField> {
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
