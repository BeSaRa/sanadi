import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { TrainingProgramBriefcase } from '@app/models/training-program-briefcase';
import { TrainingProgramBriefcaseInterceptor } from '@app/model-interceptors/training-program-briefcase-interceptor';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@app/services/url.service';
import { DialogService } from '@app/services/dialog.service';
import { FactoryService } from '@app/services/factory.service';
import { TrainingProgram } from '@app/models/training-program';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { catchError, map } from 'rxjs/operators';
import {
  TrainingBriefcasePopupComponent
} from '@app/training-services/popups/training-briefcase-popup/training-briefcase-popup.component';
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";
import { CrudGenericService } from "@app/generics/crud-generic-service";

@CastResponseContainer({
  $default: {
    model: () => TrainingProgramBriefcase
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => TrainingProgramBriefcase }
  }
})
@Injectable({
  providedIn: 'root'
})
export class TrainingProgramBriefcaseService extends CrudGenericService<TrainingProgramBriefcase> {
  list: TrainingProgramBriefcase[] = [];
  interceptor: TrainingProgramBriefcaseInterceptor = new TrainingProgramBriefcaseInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
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

  @CastResponse(undefined)
  private _loadTrainingBriefcaseByTrainingProgramId(trainingProgramId: number): Observable<TrainingProgramBriefcase[]> {
    return this.http.get<TrainingProgramBriefcase[]>(this._getServiceURL() + '/training-program-id/' + trainingProgramId);
  }

  loadTrainingBriefcaseByTrainingProgramId(trainingProgramId: number): Observable<any[]> {
    return this._loadTrainingBriefcaseByTrainingProgramId(trainingProgramId);
  }

  openTrainingBriefcaseDialog(trainingProgram: TrainingProgram, operationType: number): Observable<DialogRef> {
    return of(this.dialog.show(TrainingBriefcasePopupComponent, {
      model: trainingProgram,
      operation: operationType
    }));
  }

  private _prepareRequestList(data: { vsId: string, trainingProgramId: number, documentTitle: string }, files: { [key: string]: File }) {
    let requestsList = {}, isNewRequest = !data.vsId,
      entity: any = { ...data },
      totalFiles = !files ? 0 : Object.keys(files).length;

    if (isNewRequest) {
      delete entity.vsId;
    }

    // if add, 1 file is mandatory
    if (isNewRequest && totalFiles === 0) {
      return requestsList;
    }

    let requestUrl = isNewRequest ? this._getServiceURL() : this._getServiceURL() + '/update';

    // if updated, files can be empty (update metadata only)
    if (totalFiles === 0) {
      let form = new FormData();
      form.append('entity ', JSON.stringify(entity));
      // @ts-ignore
      requestsList['metaDataOnly'] = this.http.post(requestUrl, form)
        .pipe(
          // @ts-ignore
          map((res) => res.rs),
          catchError(_e => of(false))
        );
    } else {
      for (const filesKey in files) {
        let form = new FormData();
        form.append('entity ', JSON.stringify(entity));
        form.append('content', files[filesKey]);

        // @ts-ignore
        requestsList[filesKey] = this.http.post(requestUrl, form)
          .pipe(
            // @ts-ignore
            map((res) => res.rs),
            catchError(_e => of(false))
          );
      }
    }
    return requestsList;
  }

  saveTrainingProgramBriefcaseItem(data: { vsId: string, trainingProgramId: number, documentTitle: string }, files: { [key: string]: File }): Observable<any> {
    let requestsList = this._prepareRequestList(data, files);
    if (Object.keys(requestsList).length === 0) {
      return of('NO_REQUESTS_AVAILABLE');
    }
    return forkJoin(requestsList);
  }

  deleteTrainingProgramBriefcaseItem(briefcaseVsId: string): Observable<boolean> {
    return this.http.delete<boolean>(this._getServiceURL() + '/' + briefcaseVsId);
  }

  downloadBriefcaseItem(briefcaseItemVsid: string): Observable<Blob> {
    return this.http.get(this._getServiceURL() + '/content/' + briefcaseItemVsid, { responseType: 'blob' });
  }

  downloadBriefcase(trainingProgramId: number): Observable<Blob> {
    return this.http.get(this._getServiceURL() + '/download/training-program-id/' + trainingProgramId, { responseType: 'blob' });
  }
}
