import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer } from '@decorators/cast-response';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@services/url.service';
import { DialogService } from '@services/dialog.service';
import { FactoryService } from '@services/factory.service';
import { ComponentType } from '@angular/cdk/portal';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { IDialogData } from '@contracts/i-dialog-data';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { Pagination } from '@app/models/pagination';
import { ProposedInspection } from '@app/models/proposed-inspection';
import { ProposedInspectionPopupComponent } from '@app/modules/services/inspection/popups/proposed-inspection-popup/proposed-inspection-popup.component';
import { HasInterception, InterceptParam } from '@app/decorators/decorators/intercept-model';
import { PaginationContract } from '@app/contracts/pagination-contract';
import { EmployeeService } from './employee.service';

@CastResponseContainer({
  $default: {
    model: () => ProposedInspection
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => ProposedInspection }
  }
})
@Injectable({
  providedIn: 'root'
})
export class ProposedInspectionService extends CrudWithDialogGenericService<ProposedInspection> {
  list: ProposedInspection[] = [];

  constructor(public http: HttpClient,
    private urlService: UrlService,
    public dialog: DialogService,
    private employeeService: EmployeeService) {
    super();
    FactoryService.registerService('ProposedInspectionService', this);
  }

  _getModel(): new () => ProposedInspection {
    return ProposedInspection;
  }

  _getDialogComponent(): ComponentType<any> {
    return ProposedInspectionPopupComponent;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.PROPOSED_INSPECTION;
  }


  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((ProposedInspection: ProposedInspection) => {
        return of(this.dialog.show<IDialogData<ProposedInspection>>(ProposedInspectionPopupComponent, {
          model: ProposedInspection,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }
  @HasInterception
  @CastResponse(undefined)
  create(@InterceptParam() model: ProposedInspection): Observable<ProposedInspection> {
    return this.http.post<ProposedInspection>(this._getServiceURL(), model);
  }

  reject(@InterceptParam() model: ProposedInspection, reason: string): Observable<ProposedInspection> {
    return this.http.post<ProposedInspection>(this._getServiceURL() + `/reject/${model.id}`, reason);
  }

  paginateComposite(options: Partial<PaginationContract>): Observable<Pagination<ProposedInspection[]>> {
    return this._filterPaginate(options, {}).pipe(
      tap(result => this.list = result.rs),
      tap(result => this._loadDone$.next(result.rs))
    );
  }
  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _filterPaginate(options: Partial<PaginationContract>, paginateFilter: Partial<ProposedInspection>): Observable<Pagination<ProposedInspection[]>> {
    return this.http.post<Pagination<ProposedInspection[]>>(this._getServiceURL() + '/filter/pg', {
      departmentId: this.employeeService.getInternalDepartment()?.id,
      ...paginateFilter,
    }, {
      params: { ...options }
    })
  }

  loadByFilterPaginate(options: Partial<PaginationContract>, paginateFilter: Partial<ProposedInspection>): Observable<Pagination<ProposedInspection[]>> {
    return this._filterPaginate(options, paginateFilter).pipe(
      tap(result => this.list = result.rs),
      tap(result => this._loadDone$.next(result.rs))
    );
  }
}
