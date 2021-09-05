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
}
