import {Injectable} from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {TrainingProgram} from '@app/models/training-program';
import {ComponentType} from '@angular/cdk/portal';
import {
  TrainingProgramPopupComponent
} from '@app/training-services/popups/training-program-popup/training-program-popup.component';
import {TrainingProgramInterceptor} from '@app/model-interceptors/training-program-interceptor';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from '@app/services/url.service';
import {DialogService} from '@app/services/dialog.service';
import {FactoryService} from '@app/services/factory.service';
import {Generator} from '@app/decorators/generator';
import {Observable, of} from 'rxjs';
import {CommonUtils} from '@app/helpers/common-utils';
import {DateUtils} from '@app/helpers/date-utils';
import {ITrainingProgramCriteria} from '@app/interfaces/i-training-program-criteria';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {
  FilterTrainingProgramsComponent
} from '@app/training-services/popups/filter-training-programs/filter-training-programs.component';
import {formatDate} from '@angular/common';
import {
  TrainingProgramAttendancePopupComponent
} from '@app/training-services/popups/training-program-attendance-popup/training-program-attendance-popup.component';
import {exhaustMap, map, switchMap} from 'rxjs/operators';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {
  TrainingProgramCandidatesPopupComponent
} from '@app/training-services/popups/training-program-candidates-popup/training-program-candidates-popup.component';
import {TraineeService} from '@app/services/trainee.service';
import {
  SelectCertificateTemplatePopupComponent
} from '@app/training-services/popups/select-certificate-template-popup/select-certificate-template-popup.component';
import {TrainingProgramBriefcaseService} from '@app/services/training-program-briefcase.service';
import {CandidatesListTypeEnum} from '@app/enums/candidates-list-type.enum';
import {CertificateService} from '@app/services/certificate.service';
import {
  SelectProgramSurveyPopupComponent
} from "@app/training-services/popups/select-program-survey-popup/select-program-survey-popup.component";
import {SurveyTemplateService} from "@app/services/survey-template.service";
import {ViewSurveyPopupComponent} from "@app/shared/popups/view-survey-popup/view-survey-popup.component";

@Injectable({
  providedIn: 'root'
})
export class TrainingProgramService extends BackendWithDialogOperationsGenericService<TrainingProgram> {
  list: TrainingProgram[] = [];
  interceptor: TrainingProgramInterceptor = new TrainingProgramInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService,
              private certificateService: CertificateService,
              private surveyTemplateService: SurveyTemplateService,
              private traineeService: TraineeService,
              private trainingProgramBriefcaseService: TrainingProgramBriefcaseService) {
    super();
    FactoryService.registerService('TrainingProgramService', this);
  }

  @Generator(undefined, true, {property: 'rs'})
  filterTrainingPrograms(options?: any): Observable<TrainingProgram[]> {
    let objOptions;
    if (!CommonUtils.isEmptyObject(options) && CommonUtils.objectHasValue(options)) {
      objOptions = {...options};

      if (objOptions.hasOwnProperty('startFromDate') && objOptions.startFromDate) {
        objOptions.startFromDate = DateUtils.getDateStringFromDate(objOptions.startFromDate);
      }

      if (objOptions.hasOwnProperty('startToDate') && objOptions.startToDate) {
        objOptions.startToDate = DateUtils.getDateStringFromDate(objOptions.startToDate);
      }

      if (objOptions.hasOwnProperty('registerationFromDate') && objOptions.registerationFromDate) {
        objOptions.registerationFromDate = formatDate(DateUtils.setStartOfDay(objOptions.registerationFromDate), 'yyy-MM-dd hh:mm:ss', 'en');
      }

      if (objOptions.hasOwnProperty('registerationToDate') && objOptions.registerationToDate) {
        objOptions.registerationToDate = formatDate(DateUtils.setEndOfDay(objOptions.registerationToDate), 'yyy-MM-dd hh:mm:ss', 'en');
      }
    }

    return this.http.get<TrainingProgram[]>(this._getServiceURL() + '/criteria', {
      params: (new HttpParams({fromObject: objOptions as any}))
    });
  }

  @Generator(undefined, false, {property: 'rs'})
  approve(trainingId: number) {
    return this.http.put(this._getServiceURL() + '/approve/' + trainingId, {trainingProgramId: trainingId});
  }

  @Generator(undefined, false, {property: 'rs'})
  publish(trainingId: number) {
    return this.http.put(this._getServiceURL() + '/publish/' + trainingId, {trainingProgramId: trainingId});
  }

  @Generator(undefined, false, {property: 'rs'})
  cancel(trainingId: number) {
    return this.http.put(this._getServiceURL() + '/cancel/' + trainingId, {trainingProgramId: trainingId});
  }

  @Generator(undefined, false, {property: 'rs'})
  applyAttendance(trainingId: number, traineeList: { first: number, second: boolean }[]) {
    return this.http.put(this._getServiceURL() + '/apply-attendance-trainee/' + trainingId, traineeList);
  }

  @Generator(undefined, true, {property: 'rs'})
  loadAvailablePrograms(): Observable<TrainingProgram[]> {
    return this.http.get<TrainingProgram[]>(this._getServiceURL() + '/open-for-registeration');
  }

  @Generator(undefined, true, {property: 'rs'})
  loadFinishedPrograms(): Observable<TrainingProgram[]> {
    return this.http.get<TrainingProgram[]>(this._getServiceURL() + '/finished-programs');
  }

  @Generator(undefined, true, {property: 'rs'})
  loadCharityPrograms(): Observable<TrainingProgram[]> {
    return this.http.get<TrainingProgram[]>(this._getServiceURL() + '/charity');
  }

  openFilterDialog(filterCriteria: Partial<ITrainingProgramCriteria>): Observable<DialogRef> {
    return of(this.dialog.show(FilterTrainingProgramsComponent, {
      criteria: filterCriteria
    }, {
      escToClose: true
    }));
  }

  openAttendanceDialog(trainingProgram: TrainingProgram): Observable<DialogRef> {
    return this.getByIdComposite(trainingProgram.id).pipe(
      switchMap((model: TrainingProgram) => {
        return of(this.dialog.show<IDialogData<TrainingProgram>>(TrainingProgramAttendancePopupComponent, {
          model: model,
          operation: OperationTypes.UPDATE
        }));
      })
    );
  }

  openOrganizationCandidatesDialog(trainingProgramId: number): Observable<DialogRef> {
    return of(this.dialog.show<IDialogData<number>>(TrainingProgramCandidatesPopupComponent, {
      model: trainingProgramId,
      operation: OperationTypes.CREATE,
      candidatesListType: CandidatesListTypeEnum.ADD
    }));
  }

  openEvaluateOrganizationCandidatesDialog(trainingProgramId: number): Observable<DialogRef> {
    return of(this.dialog.show<IDialogData<number>>(TrainingProgramCandidatesPopupComponent, {
      model: trainingProgramId,
      operation: OperationTypes.CREATE,
      candidatesListType: CandidatesListTypeEnum.EVALUATE
    }));
  }

  openDownloadCertificatesDialog(trainingProgramId: number): Observable<DialogRef> {
    return of(this.dialog.show<IDialogData<number>>(TrainingProgramCandidatesPopupComponent, {
      model: trainingProgramId,
      operation: OperationTypes.CREATE,
      candidatesListType: CandidatesListTypeEnum.CERTIFY
    }));
  }

  openViewCandidatesStatusDialog(trainingProgramId: number): Observable<DialogRef> {
    return of(this.dialog.show<IDialogData<number>>(TrainingProgramCandidatesPopupComponent, {
      model: trainingProgramId,
      operation: OperationTypes.CREATE,
      candidatesListType: CandidatesListTypeEnum.VIEW_STATUS
    }));
  }

  openSelectCertificateTemplateDialog(trainingProgramId: number): Observable<DialogRef> {
    return this.certificateService.activeCertificates().pipe(
      exhaustMap(list => {
        return of(this.dialog.show<IDialogData<number>>(SelectCertificateTemplatePopupComponent, {
          model: trainingProgramId,
          operation: OperationTypes.CREATE,
          list: list
        }));
      })
    )
  }

  private getCertificationDialog(model: TrainingProgram, operation: OperationTypes): DialogRef {
    return this.dialog.show<IDialogData<TrainingProgram>>(this._getDialogComponent(), {
      operation,
      model,
      isCertification: true
    })
  }

  certificationDialog(model: TrainingProgram): Observable<DialogRef> {
    return this.getByIdComposite(model.id)
      .pipe(exhaustMap((model) => of(this.getCertificationDialog(model, OperationTypes.UPDATE))));
  }

  getViewDialog(model: TrainingProgram, operation: OperationTypes): DialogRef {
    return this.dialog.show<IDialogData<TrainingProgram>>(this._getDialogComponent(), {
      operation,
      model
    })
  }

  viewDialog(model: TrainingProgram): Observable<DialogRef> {
    return this.getByIdComposite(model.id)
      .pipe(exhaustMap((model) => of(this.getViewDialog(model, OperationTypes.VIEW))));
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

  publishSurvey(program: TrainingProgram): DialogRef {
    return this.dialog.show(SelectProgramSurveyPopupComponent, {
      program
    });
  }

  viewProgramSurvey(program: TrainingProgram): Observable<DialogRef> {
    return this.getByIdComposite(program.id)
      .pipe(switchMap((program) => {
        return this.surveyTemplateService
          .getById(program.trainingSurveyTemplateId)
          .pipe(map(template => ({template, program})))
      }))
      .pipe(map(({template, program}) => this.dialog.show(ViewSurveyPopupComponent, {template, program})))
  }
}
