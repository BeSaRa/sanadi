import { Injectable } from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {Trainee} from '@app/models/trainee';
import {ComponentType} from '@angular/cdk/portal';
import {DialogService} from '@app/services/dialog.service';
import {HttpClient} from '@angular/common/http';
import {TraineePopupComponent} from '@app/training-services/popups/trainee-popup/trainee-popup.component';
import {UrlService} from '@app/services/url.service';
import {FactoryService} from '@app/services/factory.service';
import {TraineeInterceptor} from '@app/model-interceptors/trainee-interceptor';
import {Generator} from '@app/decorators/generator';
import {Observable} from 'rxjs';
import {InterceptParam, SendInterceptor} from '@app/decorators/model-interceptor';

@Injectable({
  providedIn: 'root'
})
export class TraineeService extends BackendWithDialogOperationsGenericService<Trainee> {
  list: Trainee[] = [];
  interceptor: TraineeInterceptor = new TraineeInterceptor();
  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('TraineeService', this);
  }

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  enroll(trainingProgramId: number, @InterceptParam() model: Trainee): Observable<Trainee> {
    return this.http.put<Trainee>(this._getServiceURL() + '/enroll-trainee/' + trainingProgramId, model);
  }

  _getDialogComponent(): ComponentType<any> {
    return TraineePopupComponent;
  }

  _getModel(): any {
    return Trainee;
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
