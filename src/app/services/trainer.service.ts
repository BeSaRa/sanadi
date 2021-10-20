import { Injectable } from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {Trainer} from '@app/models/trainer';
import {ComponentType} from '@angular/cdk/portal';
import {TrainerPopupComponent} from '@app/training-services/popups/trainer-popup/trainer-popup.component';
import {TrainerInterceptor} from '@app/model-interceptors/trainer-interceptor';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@app/services/url.service';
import {DialogService} from '@app/services/dialog.service';
import {FactoryService} from '@app/services/factory.service';

@Injectable({
  providedIn: 'root'
})
export class TrainerService extends BackendWithDialogOperationsGenericService<Trainer> {
  list: Trainer[] = [];
  interceptor: TrainerInterceptor = new TrainerInterceptor();
  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService){
    super();
    FactoryService.registerService('TrainerService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return TrainerPopupComponent;
  }

  _getModel(): any {
    return Trainer;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.TRAINER;
  }
}
