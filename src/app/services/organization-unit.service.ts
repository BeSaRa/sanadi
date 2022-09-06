import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { OrgUnit } from '../models/org-unit';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { DialogRef } from '../shared/models/dialog-ref';
import {
  OrganizationUnitPopupComponent
} from '../administration/popups/organization-unit-popup/organization-unit-popup.component';
import { AuditLogService } from './audit-log.service';
import { ComponentType } from '@angular/cdk/portal';
import { OrgStatusEnum } from '@app/enums/status.enum';
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";

@CastResponseContainer({
  $default: {
    model: () => OrgUnit
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => OrgUnit }
  }
})
@Injectable({
  providedIn: 'root'
})
export class OrganizationUnitService extends CrudWithDialogGenericService<OrgUnit> {
  list!: OrgUnit[];

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService,
              private auditLogService: AuditLogService) {
    super();
    FactoryService.registerService('OrganizationUnitService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return OrganizationUnitPopupComponent;
  }

  _getModel(): any {
    return OrgUnit;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ORGANIZATION_UNIT;
  }

  deactivate(id: number): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/' + id + '/de-activate', {});
  }

  deactivateBulk(ids: number[]): Observable<{ [key: number]: boolean }> {
    return this.http.put<{ [key: number]: boolean }>(this._getServiceURL() + '/bulk/de-activate', ids);
  }

  updateStatus(id: number, currentStatus: OrgStatusEnum) {
    return currentStatus === OrgStatusEnum.ACTIVE ? this.deactivate(id) : this.activate(id);
  }

  private activate(id: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + id + '/activate', {});
  }

  updateLogo(id: number, file: File): Observable<boolean> {
    let form = new FormData();
    form.append('content', file);
    return this.http.post<boolean>(this._getServiceURL() + '/banner-logo?id=' + id, form);
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  getOrganizationUnitsByOrgType(orgType: number) {
    if (!orgType) {
      return of([]);
    }
    return this.http.get<OrgUnit[]>(this._getServiceURL() + '/org-unit-type' + '?orgUnitType[]=' + orgType);
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  getActiveOrgUnits() {

    return this.http.get<OrgUnit[]>(this._getServiceURL() + '/active/lookup/');
  }

  openAuditLogsById(id: number): Observable<DialogRef> {
    return this.auditLogService.openAuditLogsDialog(id, this._getServiceURL());
  }
}
