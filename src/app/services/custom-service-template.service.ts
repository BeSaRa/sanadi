import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {CastResponse, CastResponseContainer} from '@app/decorators/decorators/cast-response';
import {HasInterception, InterceptParam} from '@app/decorators/decorators/intercept-model';
import {CaseTypes} from '@app/enums/case-types.enum';
import {BlobModel} from '@app/models/blob-model';
import {CustomServiceTemplate} from '@app/models/custom-service-template';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {DialogService} from './dialog.service';
import {FactoryService} from './factory.service';
import {UrlService} from './url.service';
import {DialogRef} from "@app/shared/models/dialog-ref";
import {IDialogData} from "@contracts/i-dialog-data";
import {OperationTypes} from "@enums/operation-types.enum";
import {
  ServiceDataCustomTemplatePopupComponent
} from "@app/administration/popups/service-data-custom-template-popup/service-data-custom-template-popup.component";
import {CommonStatusEnum} from "@enums/common-status.enum";

@CastResponseContainer({
  $default: {
    model: () => CustomServiceTemplate
  }
})
@Injectable({
  providedIn: 'root'
})
export class CustomServiceTemplateService {

  constructor(private domSanitizer: DomSanitizer,
              private urlService: UrlService,
              public http: HttpClient,
              public dialog: DialogService,) {
    FactoryService.registerService('CustomServiceTemplateService', this);
  }

  _getServiceURLByCaseType(caseType: CaseTypes) {
    if (caseType == CaseTypes.AWARENESS_ACTIVITY_SUGGESTION) {
      return this.urlService.URLS.AWARENESS_ACTIVITY_SUGGESTION;
    } else { // caseType == CaseTypes.ORGANIZATION_ENTITIES_SUPPORT
      return this.urlService.URLS.ORGANIZATION_ENTITIES_SUPPORT;
    }
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  loadTemplateDocId(caseType: CaseTypes, docId: string) {
    return this.http.get(this._getServiceURLByCaseType(caseType) + '/template/' + docId + '/download', {
      responseType: 'blob',
      observe: 'body'
    }).pipe(
      map(blob => new BlobModel(blob, this.domSanitizer),
        catchError(_ => {
          return of(new BlobModel(new Blob([], {type: 'error'}), this.domSanitizer));
        })));
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  loadTemplatesByCaseType(caseType: CaseTypes) {
    return this.http.get<CustomServiceTemplate[]>(this._getServiceURLByCaseType(caseType) + '/templates')
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  loadActiveTemplatesByCaseType(caseType: CaseTypes) {
    return this.http.get<CustomServiceTemplate[]>(this._getServiceURLByCaseType(caseType) + '/templates?isActive=true')
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  loadTemplatesByCaseId(caseType: CaseTypes, caseId: string) {
    return this.http.get<CustomServiceTemplate[]>(this._getServiceURLByCaseType(caseType) + '/' + caseId + '/templates')
  }

  @HasInterception
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addTemplate(caseType: CaseTypes, @InterceptParam() model: CustomServiceTemplate, file: File) {
    const formData = new FormData();
    file ? formData.append('content', file) : null;
    return this.http.post<any>(this._getServiceURLByCaseType(caseType) + '/template/service', formData, {
      params: new HttpParams({fromObject: model as any})
    }).pipe(catchError(() => of(null)));
  }

  @HasInterception
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  updateContent(caseType: CaseTypes, @InterceptParam() model: CustomServiceTemplate, file: File) {
    const formData = new FormData();
    file ? formData.append('content', file) : null;
    return this.http.post<any>(this._getServiceURLByCaseType(caseType) + '/template/update-content', formData, {
      params: new HttpParams({fromObject: model as any})
    }).pipe(catchError(() => of(null)));
  }

  @HasInterception
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  updateProp(caseType: CaseTypes, @InterceptParam() model: CustomServiceTemplate) {
    return this.http.post<any>(this._getServiceURLByCaseType(caseType) + '/template/update-prop', model)
      .pipe(catchError(() => of(null)));
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  uploadCaseDoc(caseType: CaseTypes, caseId: string, @InterceptParam() model: {
    documentDTO: Partial<CustomServiceTemplate>
  }, file: File) {
    const formData = new FormData();
    file ? formData.append('content', file) : null;
    return this.http.post<any>(this._getServiceURLByCaseType(caseType) + '/' + caseId + '/template', formData, {
      params: new HttpParams({
        fromObject: model.documentDTO as any
      })
    }).pipe(catchError(() => of(null)));
  }

  private _getDialogComponent() {
    return ServiceDataCustomTemplatePopupComponent;
  }

  openAddDialog(caseType: CaseTypes, list: CustomServiceTemplate[]): DialogRef {
    return this.dialog.show<IDialogData<CustomServiceTemplate>>(this._getDialogComponent(), {
      operation: OperationTypes.CREATE,
      model: new CustomServiceTemplate(),
      caseType,
      list
    });
  }

  openUpdateDialog(template: CustomServiceTemplate, caseType: CaseTypes, list: CustomServiceTemplate[]): Observable<DialogRef> {
    return of(this.dialog.show<IDialogData<CustomServiceTemplate>>(this._getDialogComponent(), {
      model: template,
      operation: OperationTypes.UPDATE,
      caseType,
      list
    }))
  }

  openViewDialog(template: CustomServiceTemplate, caseType: CaseTypes, list: CustomServiceTemplate[]): Observable<DialogRef> {
    return of(this.dialog.show<IDialogData<CustomServiceTemplate>>(this._getDialogComponent(), {
      model: template,
      operation: OperationTypes.VIEW,
      caseType,
      list
    }))
  }

  updateStatus(caseType: CaseTypes, template: CustomServiceTemplate, newStatus: CommonStatusEnum) {
    template.isActive = (newStatus === CommonStatusEnum.ACTIVATED);
    return this.updateProp(caseType, template);
  }
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  deleteDocument(caseType: CaseTypes,  docId: string) {
   return this.http.delete(this._getServiceURLByCaseType(caseType) + '/document/' + docId )
  }

}
