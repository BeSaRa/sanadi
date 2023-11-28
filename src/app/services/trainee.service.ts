import { Injectable } from '@angular/core';
import { Trainee } from '@app/models/trainee';
import { ComponentType } from '@angular/cdk/portal';
import { DialogService } from '@app/services/dialog.service';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@app/services/url.service';
import { FactoryService } from '@app/services/factory.service';
import { TraineeInterceptor } from '@app/model-interceptors/trainee-interceptor';
import { Observable, of } from 'rxjs';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import {
  TrainingProgramTraineePopupComponent
} from '@app/training-services/popups/training-program-trainee-popup/training-program-trainee-popup.component';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { exhaustMap } from 'rxjs/operators';
import { TraineeData } from '@app/models/trainee-data';
import {
  RejectTraineePopupComponent
} from '@app/training-services/popups/reject-trainee-popup/reject-trainee-popup.component';
import { CastResponse, CastResponseContainer } from '@decorators/cast-response';
import { Pagination } from '@app/models/pagination';
import { HasInterception, InterceptParam } from '@decorators/intercept-model';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';

@CastResponseContainer({
  $default: {
    model: () => Trainee
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => Trainee }
  },
  traineeByTrainingIdAndTraineeId: {
    model: () => TraineeData
  }
})
@Injectable({
  providedIn: 'root'
})
export class TraineeService extends CrudWithDialogGenericService<Trainee> {
  list: Trainee[] = [];
  interceptor: TraineeInterceptor = new TraineeInterceptor();

  constructor(public http: HttpClient,
    private urlService: UrlService,
    public dialog: DialogService) {
    super();
    FactoryService.registerService('TraineeService', this);
  }

  @HasInterception
  @CastResponse(undefined)
  enrollTrainee(trainingProgramId: number, @InterceptParam() model: Trainee): Observable<Trainee> {
    return this.http.put<Trainee>(this._getServiceURL() + '/enroll-trainee/' + trainingProgramId, model);
  }

  @HasInterception
  @CastResponse(undefined)
  updateTrainee(trainingProgramId: number, @InterceptParam() model: Trainee): Observable<Trainee> {
    return this.http.put<Trainee>(this._getServiceURL() + '/participants/training-program-id/' + trainingProgramId, model);
  }

  @CastResponse(undefined)
  accept(trainingProgramId: number, traineeId: number): Observable<Trainee> {
    return this.http.put<Trainee>(this._getServiceURL() + '/accept-trainee/training-program-id/' + trainingProgramId + '/trainee-id/' + traineeId, {
      trainingProgramId: trainingProgramId,
      traineeId: traineeId
    });
  }

  @CastResponse(undefined)
  acceptBulk(trainees: {
    trainingProgramId: number,
    traineeId: number
  }[]): Observable<Trainee> {
    return this.http.put<Trainee>(this._getServiceURL() + '/bulk/accept-trainee', trainees);
  }

  @CastResponse('')
  reject(trainingProgramId: number, traineeId: number, refusalComment: string): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/refuse-trainee',
      { trainingProgramId: trainingProgramId, traineeId: traineeId, refusalComment: refusalComment });
  }
  @CastResponse('')
  rejectBulk(trainees: { trainingProgramId: number, traineeId: number, refusalComment: string }[]): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/bulk/refuse-trainee', trainees);
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

  @CastResponse(undefined)
  trainingProgramCandidates(trainingProgramId: number): Observable<Trainee[]> {
    return this.http.get<Trainee[]>(this._getServiceURL() + '/participants/training-program-id/' + trainingProgramId);
  }

  @CastResponse(() => TraineeData)
  traineeByTrainingIdAndTraineeId(trainingProgramId: number, traineeId: number): Observable<TraineeData> {
    return this.http.get<TraineeData>(this._getServiceURL() + '/training-program-id/' + trainingProgramId + '/trainee-id/' + traineeId);
  }

  openAddTrainingProgramCandidateDialog(trainingProgramId: number): DialogRef {
    return this.dialog.show<IDialogData<Trainee>>(TrainingProgramTraineePopupComponent, {
      model: new Trainee(),
      operation: OperationTypes.CREATE,
      trainingProgramId: trainingProgramId
    });
  }

  openEditTrainingProgramCandidateDialog(trainingProgramId: number, trainee?: Trainee): DialogRef {
    return this.dialog.show<IDialogData<Trainee>>(TrainingProgramTraineePopupComponent, {
      model: trainee!,
      operation: OperationTypes.UPDATE,
      trainingProgramId: trainingProgramId
    });
  }

  openRejectCandidateDialog(ids: number[], trainingProgramId: number, comment: string): Observable<DialogRef> {
    return of(this.dialog
      .show<{ ids: number[], trainingProgramId: number, comment: string }>(RejectTraineePopupComponent, {
        ids: ids,
        trainingProgramId: trainingProgramId,
        comment: comment
      }));
  }

  private openEvaluateCandidateDialog(model: TraineeData, trainingProgramId: number, operation: OperationTypes): DialogRef {
    return this.dialog.show<IDialogData<Trainee>>(this._getDialogComponent(), {
      model: model.trainee,
      operation: operation,
      trainingProgramId: trainingProgramId
    });
  }

  openEvaluateTrainingProgramCandidateDialog(trainingProgramId: number, traineeId: number): Observable<DialogRef> {
    {
      return this.traineeByTrainingIdAndTraineeId(trainingProgramId, traineeId)
        .pipe(exhaustMap((model) => of(this.openEvaluateCandidateDialog(model, trainingProgramId, OperationTypes.VIEW))));
    }
  }
}
