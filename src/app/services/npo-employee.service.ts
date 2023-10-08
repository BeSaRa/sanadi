import { CharityBranch } from './../models/charity-branch';
import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { NpoEmployee } from '@app/models/npo-employee';
import { Pagination } from '@app/models/pagination';
import { DialogService } from './dialog.service';
import { UrlService } from './url.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Observable, of } from 'rxjs';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { map, switchMap } from 'rxjs/operators';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { FactoryService } from './factory.service';
import { NpoEmployeePopupComponent } from '@app/administration/popups/npo-employee-popup/npo-employee-popup.component';

@CastResponseContainer({
  $default: {
    model: () => NpoEmployee,
  },
  $charityBranch: {
    model: () => CharityBranch,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => NpoEmployee },
  },
})
@Injectable({
  providedIn: 'root'
})
export class NpoEmployeeService extends CrudWithDialogGenericService<NpoEmployee> {
  list: NpoEmployee[] = [];

  constructor(
    public dialog: DialogService,
    public http: HttpClient,
    private urlService: UrlService
  ) {
    super();
    FactoryService.registerService('NpoEmployeeService', this);
  }
  _getServiceURL(): string {
    return this.urlService.URLS.NPO_EMPLOYEE;
  }
  _getDialogComponent(): ComponentType<any> {
    return NpoEmployeePopupComponent;
  }
  _getModel(): new () => NpoEmployee {
    return NpoEmployee;
  }
  updateStatus(recordId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(recordId) : this._deactivate(recordId);
  }
  private _activate(recordId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + recordId + '/activate', {});
  }
  private _deactivate(recordId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + recordId + '/de-activate', {});
  }
  updateStatusBulk(recordIds: number[], newStatus: CommonStatusEnum): Observable<any> {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activateBulk(recordIds) : this._deactivateBulk(recordIds);
  }
  private _activateBulk(recordIds: number[]) {
    return this.http.put(this._getServiceURL() + '/bulk/activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }
  private _deactivateBulk(recordIds: number[]) {
    return this.http.put(this._getServiceURL() + '/bulk/de-activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }

  @CastResponse(undefined)
  getByOrganizationId(id: number) {
    return this.http.get<NpoEmployee[]>(this._getServiceURL() + '/org/' + id);
  }
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$charityBranch'
  })
  getCharityHeadQuarterBranch() {
    return this.http.get<CharityBranch[]>(this._getServiceURL() + '/charity/branch/headquarters');
  }

  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((emp: NpoEmployee) => {
        return of(this.dialog.show<IDialogData<NpoEmployee>>(NpoEmployeePopupComponent, {
          model: emp,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }
}
