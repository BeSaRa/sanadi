import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { HasInterception, InterceptParam } from '@app/decorators/decorators/intercept-model';
import { CaseTypes } from '@app/enums/case-types.enum';
import { BlobModel } from '@app/models/blob-model';
import { CustomServiceTemplate } from '@app/models/custom-service-template';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';

@CastResponseContainer({
  $default: {
    model: () => CustomServiceTemplate
  }
})
@Injectable({
  providedIn: 'root'
})
export class CustomServiceTemplateService {

  constructor(
    private domSanitizer: DomSanitizer,
    private urlService: UrlService,
    public http: HttpClient,
    public dialog: DialogService,
  ) {
    FactoryService.registerService('CustomServiceTemplateService', this);
  }

  _getServiceURLByCaseType(caseType: number) {
    console.log(caseType)
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
  loadTemplateDocId(caseType: number = 0, docId: string) {
    return this.http.get(this._getServiceURLByCaseType(caseType) + '/template/' + docId + '/download', {
      responseType: 'blob',
      observe: 'body'
    }).pipe(
      map(blob => new BlobModel(blob, this.domSanitizer),
        catchError(_ => {
          return of(new BlobModel(new Blob([], { type: 'error' }), this.domSanitizer));
        })));
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  loadTemplatesbyCaseType(caseType: number, isActive = true) {
    return this.http.get<CustomServiceTemplate[]>(this._getServiceURLByCaseType(caseType) + '/templates?isActive=true')
  }
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  loadTemplatesbyCaseId(caseType: number, caseId: string) {
    return this.http.get<CustomServiceTemplate[]>(this._getServiceURLByCaseType(caseType) + '/' + caseId + '/templates')
  }
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  addTemplate(caseType: number = 0, @InterceptParam() model: CustomServiceTemplate, file: File) {
    const formData = new FormData();
    file ? formData.append('content', file) : null;
    return this.http.post<any>(this._getServiceURLByCaseType(caseType) + '/template/service', formData, {
      params: new HttpParams({ fromObject: model as any })
    }).pipe(catchError(() => of(null)));
  }
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  updateContent(caseType: number = 0, @InterceptParam() model: CustomServiceTemplate, file: File) {
    const formData = new FormData();
    file ? formData.append('content', file) : null;
    return this.http.post<any>(this._getServiceURLByCaseType(caseType) + '/template/update-content', formData, {
      params: new HttpParams({ fromObject: model as any })
    }).pipe(catchError(() => of(null)));
  }
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  updateProp(caseType: number = 0, model: CustomServiceTemplate) {
    console.log(model)
    return this.http.post<any>(this._getServiceURLByCaseType(caseType) + '/template/update-prop', model)
      .pipe(catchError(() => of(null)));
  }
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  uploadCaseDoc(caseType: number = 0, @InterceptParam() model: { documentDTO: Partial<CustomServiceTemplate>, caseId: string }, file: File) {
    const formData = new FormData();
    file ? formData.append('content', file) : null;
    console.log(model)
    return this.http.post<any>(this._getServiceURLByCaseType(caseType) + '/' + model.caseId + '/template', formData, {
      params: new HttpParams({
        fromObject: model.documentDTO as any
      })
    }).pipe(catchError(() => of(null)));
  }
}
