import { HasInterception } from '@decorators/intercept-model';
import { Injectable } from '@angular/core';
import { JobTitle } from '@app/models/job-title';
import { ComponentType } from '@angular/cdk/portal';
import { JobTitlePopupComponent } from '@app/administration/popups/job-title-popup/job-title-popup.component';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@app/services/url.service';
import { DialogService } from '@app/services/dialog.service';
import { FactoryService } from '@app/services/factory.service';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";

@CastResponseContainer({
  $default: {
    model: () => JobTitle
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => JobTitle }
  }
})
@Injectable({
  providedIn: 'root'
})
export class JobTitleService extends CrudWithDialogGenericService<JobTitle> {
  _getModel(): new () => JobTitle {
    return JobTitle
  }

  list: JobTitle[] = [];

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('JobTitleService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return JobTitlePopupComponent;
  }


  _getServiceURL(): string {
    return this.urlService.URLS.JOB_TITLE;
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  getExternalJobTitle(): Observable<JobTitle[]> {
    return this.http.get<JobTitle[]>(this._getServiceURL() + '/external');
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  getSystemJobTitle(): Observable<JobTitle[]> {
    return this.http.get<JobTitle[]>(this._getServiceURL() + '/system');
  }

  updateStatus(recordId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(recordId) : this._deactivate(recordId);
  }

  updateStatusBulk(recordIds: number[], newStatus: CommonStatusEnum): Observable<any> {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activateBulk(recordIds) : this._deactivateBulk(recordIds);
  }

  private _activate(recordId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + recordId + '/activate', {});
  }

  private _deactivate(recordId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + recordId + '/de-activate', {});
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


  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((jobTitle: JobTitle) => {
        return of(this.dialog.show<IDialogData<JobTitle>>(JobTitlePopupComponent, {
          model: jobTitle,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }
}
