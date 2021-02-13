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
import {interceptOrganizationUnit} from '../model-interceptors/organization-unit-interceptor';
import {OrganizationUnitPopupComponent} from '../administration/popups/organization-unit-popup/organization-unit-popup.component';

@Injectable({
  providedIn: 'root'
})
export class OrganizationUnitService extends BackendGenericService<OrgUnit> {
  list!: OrgUnit[];
  _loadDone$!: Subject<OrgUnit[]>;

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private  dialogService: DialogService) {
    super();
    FactoryService.registerService('OrganizationUnitService', this);
  }

  openCreateDialog(): DialogRef {
    return this.dialogService.show<IDialogData<OrgUnit>>(OrganizationUnitPopupComponent, {
      model: new OrgUnit(),
      operation: OperationTypes.CREATE
    });
  }

  openUpdateDialog(modelId: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((orgUnit: OrgUnit) => {
        return of(this.dialogService.show<IDialogData<OrgUnit>>(OrganizationUnitPopupComponent, {
          model: orgUnit,
          operation: OperationTypes.UPDATE
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
  }
}
