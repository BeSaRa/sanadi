import { switchMap } from 'rxjs/operators';
import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { OrganizationUnitField } from '@app/models/organization-unit-field';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';
import { Observable, of } from 'rxjs';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { OperationTypes } from '@app/enums/operation-types.enum';
import {
  OrganizationUnitFieldPopupComponent
} from '@app/administration/popups/organization-unit-field-popup/organization-unit-field-popup.component';
import { Pagination } from "@app/models/pagination";
import {CommonStatusEnum} from '@app/enums/common-status.enum';

@CastResponseContainer({
  $default: {
    model: () => OrganizationUnitField
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => OrganizationUnitField }
  }
})
@Injectable({
  providedIn: 'root'
})
export class OrganizationUnitFieldService extends CrudWithDialogGenericService<OrganizationUnitField> {
  _getDialogComponent(): ComponentType<any> {
    return OrganizationUnitFieldPopupComponent;
  }

  _getModel(): new () => OrganizationUnitField {
    return OrganizationUnitField;
  }

  list: OrganizationUnitField[] = [];

  _getServiceURL(): string {
    return this.urlService.URLS.ORG_UNIT_FIELD;
  }

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('OrganizationUnitFieldService', this);
  }

  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((organizationUnitField: OrganizationUnitField) => {
        return of(this.dialog.show<IDialogData<OrganizationUnitField>>(OrganizationUnitFieldPopupComponent, {
          model: organizationUnitField,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }

  updateStatus(modelId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(modelId) : this._deactivate(modelId);
  }

  private _activate(modelId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + modelId + '/activate', {});
  }

  private _deactivate(modelId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + modelId + '/de-activate', {});
  }
}
