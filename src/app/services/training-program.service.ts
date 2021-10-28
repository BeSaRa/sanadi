import { Injectable } from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {TrainingProgram} from '@app/models/training-program';
import {ComponentType} from '@angular/cdk/portal';
import {TrainingProgramPopupComponent} from '@app/training-services/popups/training-program-popup/training-program-popup.component';
import {TrainingProgramInterceptor} from '@app/model-interceptors/training-program-interceptor';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@app/services/url.service';
import {DialogService} from '@app/services/dialog.service';
import {FactoryService} from '@app/services/factory.service';

@Injectable({
  providedIn: 'root'
})
export class TrainingProgramService extends BackendWithDialogOperationsGenericService<TrainingProgram>{
  list: TrainingProgram[] = [];
  interceptor: TrainingProgramInterceptor = new TrainingProgramInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('TrainingProgramService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return TrainingProgramPopupComponent;
  }

  _getModel(): any {
    return TrainingProgram;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.TRAINING_PROGRAM;
  }
}
