import { Injectable } from '@angular/core';
import { Trainer } from '@app/models/trainer';
import { ComponentType } from '@angular/cdk/portal';
import {
  AccreditedTrainerPopupComponent
} from '@app/training-services/popups/accredited-trainer-popup/accredited-trainer-popup.component';
import { TrainerInterceptor } from '@app/model-interceptors/trainer-interceptor';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@app/services/url.service';
import { DialogService } from '@app/services/dialog.service';
import { FactoryService } from '@app/services/factory.service';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { BlobModel } from '@app/models/blob-model';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { OperationTypes } from '@app/enums/operation-types.enum';
import {
  ViewDocumentPopupComponent
} from '@app/training-services/popups/view-document-popup/view-document-popup.component';
import { CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";

@CastResponseContainer({
  $default: {
    model: () => Trainer
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => Trainer }
  }
})
@Injectable({
  providedIn: 'root'
})
export class TrainerService extends CrudWithDialogGenericService<Trainer> {
  list: Trainer[] = [];
  interceptor: TrainerInterceptor = new TrainerInterceptor();
  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService,
              private domSanitizer: DomSanitizer,
              private dialogService: DialogService){
    super();
    FactoryService.registerService('TrainerService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return AccreditedTrainerPopupComponent;
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

  uploadResume(trainerId: number, documentTitle: string, resume: File): Observable<string> {
    const formData = new FormData();
    formData.append('content', resume);
    formData.append('entity', JSON.stringify({trainerId: trainerId, documentTitle: documentTitle}));
    return this.http.post<string>(this._getServiceURL() + '/trainer-cv', formData).pipe(
      map((response: any) => {
        return response.rs;
      })
    );
  }

  getResume(vsId: string): Observable<BlobModel> {
    return this.http.get(this._getServiceURL() + '/trainer-cv/content/' + vsId, {
      responseType : 'blob',
      observe : 'body'
    }).pipe(
      map(blob => new BlobModel(blob , this.domSanitizer ),
        catchError(_ => {
          return of(new BlobModel(new Blob([], {type: 'error'}), this.domSanitizer));
        })));
  }

  viewResumeDialog(trainer: Trainer): Observable<DialogRef> {
    return this.getResume(trainer.trainerCV.vsId).pipe(
      switchMap((blobModel: BlobModel) => {
        return of(this.dialogService.show<IDialogData<Trainer>>(ViewDocumentPopupComponent, {
          model: trainer,
          operation: OperationTypes.UPDATE,
          blob: blobModel,
          titleHasPlaceHolder: true,
          titleKey: 'view_trainer_x_cv_title',
          getNameFunc: trainer.getName.bind(trainer)
        }));
      })
    );
  }
}
