import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {OrgBranch} from '../models/org-branch';
import {FactoryService} from './factory.service';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {
  interceptOrganizationBranch,
  interceptOrganizationBranchReceive
} from '../model-interceptors/organization-branch-interceptor';
import {Observable, of} from 'rxjs';
import {Generator} from '../decorators/generator';
import {DialogRef} from '../shared/models/dialog-ref';
import {IDialogData} from '../interfaces/i-dialog-data';
import {OperationTypes} from '../enums/operation-types.enum';
import {switchMap} from 'rxjs/operators';
import {DialogService} from './dialog.service';
import {OrganizationBranchPopupComponent} from '../administration/popups/organization-branch-popup/organization-branch-popup.component';
import {OrgUnit} from '../models/org-unit';

@Injectable({
  providedIn: 'root'
})
export class OrganizationBranchService extends BackendGenericService<OrgBranch> {
  list!: OrgBranch[];

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private  dialogService: DialogService) {
    super();
    FactoryService.registerService('OrganizationBranchService', this);
  }

  _getModel(): any {
    return OrgBranch;
  }

  _getSendInterceptor(): any {
    return interceptOrganizationBranch;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ORGANIZATION_BRANCH;
  }

  @Generator(undefined, true)
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

  openCreateDialog(orgUnit: OrgUnit): DialogRef {
    return this.dialogService.show<IDialogData<OrgBranch>>(OrganizationBranchPopupComponent, {
      model: new OrgBranch(),
      orgUnit,
      operation: OperationTypes.CREATE
    });
  }

  openUpdateDialog(modelId: number, orgUnit: OrgUnit): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((branch: OrgBranch) => {
        return of(this.dialogService.show<IDialogData<OrgBranch>>(OrganizationBranchPopupComponent, {
          model: branch,
          orgUnit,
          operation: OperationTypes.UPDATE
        }));
      })
    );
  }

  deactivate(id: number): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/' + id + '/de-activate', {});
  }

  deactivateBulk(ids: number[]): Observable<{[key: number]: boolean}> {
    return this.http.put<{[key: number]: boolean}>(this._getServiceURL() + '/bulk/de-activate', ids);
  }

  _getReceiveInterceptor(): any {
    return interceptOrganizationBranchReceive;
  }
}
