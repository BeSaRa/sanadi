import {Injectable} from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {Trainee} from '@app/models/trainee';
import {ComponentType} from '@angular/cdk/portal';
import {DialogService} from '@app/services/dialog.service';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@app/services/url.service';
import {FactoryService} from '@app/services/factory.service';
import {TraineeInterceptor} from '@app/model-interceptors/trainee-interceptor';
import {Generator} from '@app/decorators/generator';
import {Observable, of} from 'rxjs';
import {InterceptParam, SendInterceptor} from '@app/decorators/model-interceptor';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {TrainingProgramTraineePopupComponent} from '@app/training-services/popups/training-program-trainee-popup/training-program-trainee-popup.component';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {exhaustMap} from 'rxjs/operators';
import {TraineeData} from '@app/models/trainee-data';
import {RejectTraineePopupComponent} from '@app/training-services/popups/reject-trainee-popup/reject-trainee-popup.component';

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

  @Generator(undefined, false, {property: 'rs'})
  accept(trainingProgramId: number, traineeId: number) {
    return this.http.put(this._getServiceURL() + '/accept-trainee/training-program-id/' + trainingProgramId + '/trainee-id/' + traineeId, {
      trainingProgramId: trainingProgramId,
      traineeId: traineeId
    });
  }

  @Generator(undefined, false, {property: 'rs'})
  reject(trainingProgramId: number, traineeId: number, refusalComment: string) : Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/refuse-trainee',
      {trainingProgramId: trainingProgramId, traineeId: traineeId, refusalComment: refusalComment});
  }

  deleteTrainee(trainingProgramId: number, traineeId: number): Observable<boolean> {
    return this.http.delete<boolean>(this._getServiceURL() + '/delete-trainee/training-program-id/' + trainingProgramId + '/trainee-id/' + traineeId);
  }

  _getDialogComponent(): ComponentType<any> {
    return TrainingProgramTraineePopupComponent;
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

  @Generator(undefined, true, {property: 'rs'})
  trainingProgramCandidates(trainingProgramId: number): Observable<Trainee[]> {
    return this.http.get<Trainee[]>(this._getServiceURL() + '/participants/training-program-id/' + trainingProgramId);
  }

  @Generator(undefined, false, {property: 'rs'})
  traineeByTrainingIdAndTraineeId(trainingProgramId: number, traineeId: number) {
    return this.http.get<TraineeData>(this._getServiceURL() + '/training-program-id/' + trainingProgramId + '/trainee-id/' + traineeId);
  }

  openAddTrainingProgramCandidateDialog(trainingProgramId: number): DialogRef {
    return this.dialog.show<IDialogData<Trainee>>(TrainingProgramTraineePopupComponent, {
      model: new Trainee(),
      operation: OperationTypes.CREATE,
      trainingProgramId: trainingProgramId,
      isEvaluate: false
    });
  }

  openRejectCandidateDialog(model: Trainee, trainingProgramId: number, comment: string): Observable<DialogRef> {
    return of(this.dialog.show<IDialogData<Trainee>>(RejectTraineePopupComponent, {
      model: model,
      operation: OperationTypes.UPDATE,
      trainingProgramId: trainingProgramId,
      comment: comment
    }));
  }

  private openEvaluateCandidateDialog(model: TraineeData, trainingProgramId: number, operation: OperationTypes): DialogRef {
    return this.dialog.show<IDialogData<TraineeData>>(this._getDialogComponent(), {
      model: model,
      operation: operation,
      trainingProgramId: trainingProgramId,
      isEvaluate: true
    });
  }

  openEvaluateTrainingProgramCandidateDialog(trainingProgramId: number, traineeId: number): Observable<DialogRef> {
    {
      return this.traineeByTrainingIdAndTraineeId(trainingProgramId, traineeId)
        .pipe(exhaustMap((model) => of(this.openEvaluateCandidateDialog(model, trainingProgramId, OperationTypes.UPDATE))));
    }
  }
}
