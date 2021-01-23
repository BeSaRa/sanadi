import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {OrgUser} from '../models/org-user';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';
import {interceptOrganizationUser} from '../model-interceptors/org-user-interceptor';
import {DialogRef} from '../shared/models/dialog-ref';
import {IDialogData} from '../interfaces/i-dialog-data';
import {OperationTypes} from '../enums/operation-types.enum';
import {forkJoin, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {DialogService} from './dialog.service';
import {OrganizationUserPopupComponent} from '../administration/popups/organization-user-popup/organization-user-popup.component';
import {CustomRoleService} from './custom-role.service';
import {Generator} from '../decorators/generator';
import {IOrgUserCriteria} from '../interfaces/i-org-user-criteria';
import {isValidValue} from '../helpers/utils';
import {OrganizationUnitService} from './organization-unit.service';
import {CustomRole} from '../models/custom-role';
import {OrgUnit} from '../models/org-unit';

@Injectable({
  providedIn: 'root'
})
export class OrganizationUserService extends BackendGenericService<OrgUser> {
  list!: OrgUser[];

  constructor(public http: HttpClient, private urlService: UrlService, private dialogService: DialogService) {
    super();
    FactoryService.registerService('OrganizationUserService', this);
  }

  openCreateDialog(): Observable<DialogRef> {
    return this._loadCustomRolesAndOrgUnits()
      .pipe(
        switchMap((res: [CustomRole[], OrgUnit[]]) => {
          return of(this.dialogService.show<IDialogData<OrgUser>>(OrganizationUserPopupComponent, {
            model: new OrgUser(),
            operation: OperationTypes.CREATE,
            customRoleList: res[0],
            orgUnitList: res[1]
          }));
        })
      );
  }

  openUpdateDialog(modelId: number): Observable<DialogRef> {
    return this._loadCustomRolesAndOrgUnits()
      .pipe(
        switchMap((res: [CustomRole[], OrgUnit[]]) => {
          return this.getById(modelId).pipe(
            switchMap((orgUser: OrgUser) => {
              return of(this.dialogService.show<IDialogData<OrgUser>>(OrganizationUserPopupComponent, {
                model: orgUser,
                operation: OperationTypes.UPDATE,
                customRoleList: res[0],
                orgUnitList: res[1]
              }));
            })
          );
        })
      );
  }

  _getModel(): any {
    return OrgUser;
  }

  _getSendInterceptor(): any {
    return interceptOrganizationUser;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ORG_USER;
  }

  _getReceiveInterceptor(): any {
  }

  private _loadCustomRolesAndOrgUnits(): Observable<[CustomRole[], OrgUnit[]]> {
    const customRoleService = FactoryService.getService<CustomRoleService>('CustomRoleService');
    const organizationUnitService = FactoryService.getService<OrganizationUnitService>('OrganizationUnitService');
    return forkJoin([customRoleService.load(), organizationUnitService.load()]);
  }


  private _buildCriteriaQueryParams(criteria: IOrgUserCriteria): HttpParams {
    let queryParams = new HttpParams();

    if (isValidValue(criteria.status)) {
      queryParams = queryParams.append('status', Number(criteria.status).toString());
    }
    if (isValidValue(criteria['org-id'])) {
      // @ts-ignore
      queryParams = queryParams.append('org-id', criteria['org-id'].toString());
    }
    if (isValidValue(criteria['org-branch-id'])) {
      // @ts-ignore
      queryParams = queryParams.append('org-branch-id', criteria['org-branch-id'].toString());
    }
    return queryParams;
  }

  @Generator(OrgUser, true)
  getByCriteria(criteria: IOrgUserCriteria): Observable<OrgUser[]> {
    const queryParams = this._buildCriteriaQueryParams(criteria);

    return this.http.get<OrgUser[]>(this.urlService.URLS.ORG_USER + '/criteria', {
      params: queryParams
    });
  }
}
