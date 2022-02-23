import { Injectable } from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {JobTitle} from '@app/models/job-title';
import {ComponentType} from '@angular/cdk/portal';
import {JobTitlePopupComponent} from '@app/administration/popups/job-title-popup/job-title-popup.component';
import {JobTitleInterceptor} from '@app/model-interceptors/job-title-interceptor';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@app/services/url.service';
import {DialogService} from '@app/services/dialog.service';
import {FactoryService} from '@app/services/factory.service';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {OperationTypes} from '@app/enums/operation-types.enum';

@Injectable({
  providedIn: 'root'
})
export class JobTitleService extends BackendWithDialogOperationsGenericService<JobTitle>{
  list: JobTitle[] = [];
  interceptor: JobTitleInterceptor = new JobTitleInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('JobTitleService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return JobTitlePopupComponent;
  }

  _getModel(): any {
    return JobTitle;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.JOB_TITLE;
  }

  updateStatus(jobTitleId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(jobTitleId) : this._deactivate(jobTitleId);
  }

  updateStatusBulk(recordIds: number[], newStatus: CommonStatusEnum): Observable<any> {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activateBulk(recordIds) : this._deactivateBulk(recordIds);
  }

  private _activate(jobTitleId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + jobTitleId + '/activate', {});
  }

  private _deactivate(jobTitleId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + jobTitleId + '/de-activate', {});
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
