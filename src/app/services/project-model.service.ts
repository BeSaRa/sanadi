import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { ProjectModel } from "@app/models/project-model";
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';
import { ProjectModelInterceptor } from "@app/model-interceptors/project-model-interceptor";
import { FactoryService } from "@app/services/factory.service";
import { UrlService } from "@app/services/url.service";
import { ProjectModelSearchCriteria } from "@app/models/project-model-search-criteria";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { DialogRef } from "@app/shared/models/dialog-ref";
import {
  SelectTemplatePopupComponent
} from "@app/modules/e-services-main/popups/select-template-popup/select-template-popup.component";
import { BlobModel } from '@app/models/blob-model';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: {
    model: () => ProjectModel
  }
})
@Injectable({
  providedIn: 'root'
})
export class ProjectModelService extends BaseGenericEService<ProjectModel> {
  _getUrlService(): UrlService {
    return this.urlService;
  }

  jsonSearchFile: string = 'external_project_models.json';
  serviceKey: keyof ILanguageKeys = 'menu_projects_models';
  interceptor: IModelInterceptor<ProjectModel> = new ProjectModelInterceptor();
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = ['fullSerial', 'domainInfo', 'caseStatus', 'projectTypeInfo', 'requestTypeInfo', 'createdOn', 'templateTypeInfo'];

  _getModel() {
    return ProjectModel;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.PROJECT_MODELING;
  }

  _getInterceptor(): Partial<IModelInterceptor<ProjectModel>> {
    return this.interceptor;
  }

  getSearchCriteriaModel<S extends ProjectModel>(): ProjectModel {
    return new ProjectModelSearchCriteria();
  }

  getCaseComponentName(): string {
    return 'ProjectModelComponent';
  }

  constructor(public http: HttpClient,
              public dialog: DialogService,
              public domSanitizer: DomSanitizer,
              public dynamicService: DynamicOptionsService,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('ProjectModelService', this);
  }

  @CastResponse(undefined)
  private _searchTemplateBySerial(serial: string): Observable<ProjectModel[]> {
    return this.http.post<ProjectModel[]>(this._getURLSegment() + '/template/search', {
      templateFullSerial: serial
    })
  }

  @CastResponse(undefined)
  private _getTemplateById(id: string): Observable<ProjectModel> {
    return this.http.get<ProjectModel>(this._getURLSegment() + '/template/' + id + '/details')
  }

  getTemplateById(id: string): Observable<ProjectModel> {
    return this._getTemplateById(id);
  }

  searchTemplateBySerial(serial: string): Observable<ProjectModel[]> {
    return this._searchTemplateBySerial(serial);
  }

  openSelectTemplate(list: ProjectModel[]): DialogRef {
    return this.dialog.show(SelectTemplatePopupComponent, {
      list,
      service: this
    })
  }

  exportTemplate(templateId: string): Observable<BlobModel> {
    return this.http.get(this._getURLSegment() + '/template/' + templateId + '/export', {
      responseType: 'blob'
    }).pipe(
      map(blob => new BlobModel(blob, this.domSanitizer),
        catchError(_ => {
          return of(new BlobModel(new Blob([], {type: 'error'}), this.domSanitizer));
        })));
  }
}
