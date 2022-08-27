import { Injectable } from '@angular/core';
import { OrgBranch } from '../models/org-branch';
import { FactoryService } from './factory.service';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { OrganizationBranchInterceptor } from '../model-interceptors/organization-branch-interceptor';
import { Observable, of } from 'rxjs';
import { DialogRef } from '../shared/models/dialog-ref';
import { IDialogData } from '@contracts/i-dialog-data';
import { OperationTypes } from '../enums/operation-types.enum';
import { switchMap } from 'rxjs/operators';
import { DialogService } from './dialog.service';
import {
  OrganizationBranchPopupComponent
} from '../administration/popups/organization-branch-popup/organization-branch-popup.component';
import { OrgUnit } from '../models/org-unit';
import { AuditLogService } from './audit-log.service';
import { ComponentType } from '@angular/cdk/portal';
import { PaginationContract } from '@contracts/pagination-contract';
import { Pagination } from '@app/models/pagination';
import { CastResponse, CastResponseContainer } from '@decorators/cast-response';
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";

@CastResponseContainer({
  $default: {
    model: () => OrgBranch
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => OrgBranch }
  }
})
@Injectable({
  providedIn: 'root'
})
export class OrganizationBranchService extends CrudWithDialogGenericService<OrgBranch> {
  list!: OrgBranch[];
  interceptor: OrganizationBranchInterceptor = new OrganizationBranchInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService,
              private auditLogService: AuditLogService) {
    super();
    FactoryService.registerService('OrganizationBranchService', this);
  }

  _getModel(): any {
    return OrgBranch;
  }

  _getDialogComponent(): ComponentType<any> {
    return OrganizationBranchPopupComponent;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ORGANIZATION_BRANCH;
  }

  @CastResponse(undefined)
  private _loadByCriteria(criteria: { orgId?: number, status?: number }): Observable<OrgBranch[]> {
    if (!criteria) {
      return of([]);
    }
    const queryString = this._generateQueryString(criteria);
    return this.http.get<OrgBranch[]>(this._getServiceURL() + '/criteria' + queryString);
  }

  loadByCriteria(criteria: { 'org-id'?: number, status?: number }): Observable<OrgBranch[]> {
    return this._loadByCriteria(criteria);
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _loadByCriteriaPaginate(options: Partial<PaginationContract>, criteria: { orgId?: number, status?: number }): Observable<Pagination<OrgBranch[]>> {
    const queryString = this._generateQueryString(criteria);
    return this.http.get<Pagination<OrgBranch[]>>(this._getServiceURL() + '/criteria' + queryString, {
      params: { ...options }
    });
  }

  loadByCriteriaPaginate(options: Partial<PaginationContract>, criteria: { 'org-id'?: number, status?: number }): Observable<Pagination<OrgBranch[]>> {
    if (!criteria) {
      return of({
        count: 0,
        rs: [],
        sc: 200
      } as Pagination<OrgBranch[]>);
    }
    return this._loadByCriteriaPaginate(options, criteria);
  }

  openCreateDialog(orgUnit: OrgUnit): DialogRef {
    return this.dialog.show<IDialogData<OrgBranch>>(OrganizationBranchPopupComponent, {
      model: new OrgBranch(),
      orgUnit,
      operation: OperationTypes.CREATE
    });
  }

  openUpdateDialog(modelId: number, orgUnit: OrgUnit): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((branch: OrgBranch) => {
        return of(this.dialog.show<IDialogData<OrgBranch>>(OrganizationBranchPopupComponent, {
          model: branch,
          orgUnit,
          operation: OperationTypes.UPDATE
        }));
      })
    );
  }

  @CastResponse('')
  deactivate(id: number): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/' + id + '/de-activate', {});
  }

  deactivateBulk(ids: number[]): Observable<{ [key: number]: boolean }> {
    return this.http.put<{ [key: number]: boolean }>(this._getServiceURL() + '/bulk/de-activate', ids);
  }

  openAuditLogsById(id: number): Observable<DialogRef> {
    return this.auditLogService.openAuditLogsDialog(id, this._getServiceURL());
  }
}
