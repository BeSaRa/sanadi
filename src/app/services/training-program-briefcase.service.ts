import {Injectable} from '@angular/core';
import {forkJoin, Observable, of} from 'rxjs';
import {TrainingProgramBriefcase} from '@app/models/training-program-briefcase';
import {TrainingProgramBriefcaseInterceptor} from '@app/model-interceptors/training-program-briefcase-interceptor';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@app/services/url.service';
import {DialogService} from '@app/services/dialog.service';
import {FactoryService} from '@app/services/factory.service';
import {TrainingProgram} from '@app/models/training-program';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {catchError, map} from 'rxjs/operators';
import {TrainingBriefcasesPopupComponent} from '@app/training-services/popups/training-briefcases-popup/training-briefcases-popup.component';
import {Generator} from '@app/decorators/generator';
import {BackendGenericService} from '@app/generics/backend-generic-service';
import {ExceptionHandlerService} from '@app/services/exception-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TrainingProgramBriefcaseService extends BackendGenericService<TrainingProgramBriefcase> {
  list: TrainingProgramBriefcase[] = [];
  interceptor: TrainingProgramBriefcaseInterceptor = new TrainingProgramBriefcaseInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private exceptionHandlerService: ExceptionHandlerService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('TrainingProgramBriefcaseService', this);
  }

  _getModel(): any {
    return TrainingProgramBriefcase;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.TRAINING_PROGRAM_BUNDLE;
  }

  @Generator(undefined, true, {property: 'rs'})
  private _loadTrainingBriefcasesByTrainingProgramId(trainingProgramId: number): Observable<TrainingProgramBriefcase[]> {
    return this.http.get<TrainingProgramBriefcase[]>(this._getServiceURL() + '/training-program-id/' + trainingProgramId);
  }

  loadTrainingBriefcasesByTrainingProgramId(trainingProgramId: number): Observable<any[]> {
    return this._loadTrainingBriefcasesByTrainingProgramId(trainingProgramId);
  }

  openTrainingBriefcasesDialog(trainingProgram: TrainingProgram): Observable<DialogRef> {
    return of(this.dialog.show(TrainingBriefcasesPopupComponent, {
      model: trainingProgram
    }));
  }

  private _createBriefcase(data: { vsId: string, trainingProgramId: number, documentTitle: string }, files: any): Observable<any> {
    let requestsList = {};
    let entity: any = {...data};
    delete entity.vsId;

    for (const filesKey in files) {
      let form = new FormData();
      form.append('entity ', JSON.stringify(entity));
      form.append('content', files[filesKey]);

      // @ts-ignore
      requestsList[filesKey] = this.http.post(this._getServiceURL(), form)
        .pipe(
          // @ts-ignore
          map((res) => res.rs),
          catchError(e => of(false))
        );
    }
    return forkJoin(requestsList);
  }

  private _updateBriefcase(data: { vsId: string, trainingProgramId: number, documentTitle: string }, files: any): Observable<any> {
    let requestsList = {};

    if (files.length === 0) {
      let form = new FormData();
      form.append('entity ', JSON.stringify(data));
      // @ts-ignore
      requestsList['metaData'] = this.http.post(this._getServiceURL() + '/update', form);
    } else {
      for (const filesKey in files) {
        let form = new FormData();
        form.append('entity ', JSON.stringify(data));
        form.append('content', files[filesKey]);

        this.exceptionHandlerService.excludeHandlingForURL(this._getServiceURL());

        // @ts-ignore
        requestsList[filesKey] = this.http.post(this._getServiceURL(), form)
          .pipe(
            // @ts-ignore
            map((res) => res.rs),
            catchError(e => of(false))
          );
      }
    }
    return forkJoin(requestsList);
  }

  saveTrainingProgramBriefcase(data: { vsId: string, trainingProgramId: number, documentTitle: string }, files: any): Observable<any> {
    let result: any;
    if (data.vsId) {
      result = this._updateBriefcase(data, files);
    } else {
      result = this._createBriefcase(data, files);
    }
    return result;
  }

  deleteTrainingProgramBriefcase(briefcaseVsId: string): Observable<boolean> {
    return this.http.delete<boolean>(this._getServiceURL() + '/' + briefcaseVsId);
  }

  downloadTrainingProgramBriefcase(trainingProgramBriefcaseVsid: string): Observable<Blob> {
    return this.http.get(this._getServiceURL() + '/content/' + trainingProgramBriefcaseVsid, {responseType: 'blob'});
  }

  downloadBulkTrainingProgramBriefcase(trainingProgramId: number): Observable<Blob> {
    return this.http.get(this._getServiceURL() + '/download/training-program-id/' + trainingProgramId, {responseType: 'blob'});
  }
}
