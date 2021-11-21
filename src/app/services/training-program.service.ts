import { Injectable } from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {TrainingProgram} from '@app/models/training-program';
import {ComponentType} from '@angular/cdk/portal';
import {TrainingProgramPopupComponent} from '@app/training-services/popups/training-program-popup/training-program-popup.component';
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
import {FilterTrainingProgramsComponent} from '@app/training-services/popups/filter-training-programs/filter-training-programs.component';
import {formatDate} from '@angular/common';

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
    return this.http.put(this._getServiceURL() + '/approve/' + trainingId, {trainingProgramId: trainingId} );
  }

  @Generator(undefined, false, {property: 'rs'})
  publish(trainingId: number) {
    return this.http.put(this._getServiceURL() + '/publish/' + trainingId, {trainingProgramId: trainingId} );
  }

  @Generator(undefined, false, {property: 'rs'})
  cancel(trainingId: number) {
    return this.http.put(this._getServiceURL() + '/cancel/' + trainingId, {trainingProgramId: trainingId} );
  }

  openFilterDialog(filterCriteria: Partial<ITrainingProgramCriteria>): Observable<DialogRef> {
    return of(this.dialog.show(FilterTrainingProgramsComponent, {
      criteria: filterCriteria
    }, {
      escToClose: true
    }));
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
