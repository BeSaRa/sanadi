import {Injectable} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {OrgUnit} from '../models/org-unit';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {DialogService} from './dialog.service';
import {BackendGenericService} from '../generics/backend-generic-service';
import {FactoryService} from './factory.service';
import {DialogRef} from '../shared/models/dialog-ref';
import {IDialogData} from '../interfaces/i-dialog-data';
import {OperationTypes} from '../enums/operation-types.enum';
import {switchMap} from 'rxjs/operators';
import {
  interceptOrganizationUnit,
  interceptOrganizationUnitReceive
} from '../model-interceptors/organization-unit-interceptor';
import {OrganizationUnitPopupComponent} from '../administration/popups/organization-unit-popup/organization-unit-popup.component';
import {Generator} from '../decorators/generator';

@Injectable({
  providedIn: 'root'
})
export class OrganizationUnitService extends BackendGenericService<OrgUnit> {
  list!: OrgUnit[];
  _loadDone$!: Subject<OrgUnit[]>;

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private dialogService: DialogService) {
    super();
    FactoryService.registerService('OrganizationUnitService', this);
  }

  openCreateDialog(): DialogRef {
    return this.dialogService.show<IDialogData<OrgUnit>>(OrganizationUnitPopupComponent, {
      model: new OrgUnit(),
      operation: OperationTypes.CREATE,
      orgUnitsList: this.list
    });
  }

  openUpdateDialog(modelId: number): Observable<DialogRef> {
    return this.loadOrgUnitByIdComposite(modelId).pipe(
      switchMap((orgUnit: OrgUnit) => {
        return of(this.dialogService.show<IDialogData<OrgUnit>>(OrganizationUnitPopupComponent, {
          model: orgUnit,
          operation: OperationTypes.UPDATE,
          orgUnitsList: this.list
        }));
      })
    );

    /*return forkJoin({
      record: this.getById(modelId),
      branches: this.orgBranchService.loadByCriteria({orgId: modelId})
    }).pipe(switchMap((result: IKeyValue) => {
        return of(this.dialogService.show<IDialogData<OrgUnit>>(OrganizationUnitPopupComponent, {
          model: result.record,
          branches: result.branches,
          operation: OperationTypes.UPDATE
        }));
      })
    );*/
  }

  deactivate(id: number): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/' + id + '/de-activate', {});
  }

  deactivateBulk(ids: number[]): Observable<{ [key: number]: boolean }> {
    return this.http.put<{ [key: number]: boolean }>(this._getServiceURL() + '/bulk/de-activate', ids);
  }

  updateLogo(id: number, file: File): Observable<boolean> {
    var form = new FormData();
    form.append('content', file);
    return this.http.post<boolean>(this._getServiceURL() + '/banner-logo?id=' + id, form);
  }

  @Generator(undefined, false, {property: 'rs'})
  loadOrgUnitByIdComposite(id: number): Observable<OrgUnit> {
    return this.http.get<OrgUnit>(this._getServiceURL() + '/' + id + '/composite');
  }

  _getModel(): any {
    return OrgUnit;
  }

  _getSendInterceptor(): any {
    return interceptOrganizationUnit;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ORGANIZATION_UNIT;
  }

  _getReceiveInterceptor(): any {
    return interceptOrganizationUnitReceive;
  }
}
