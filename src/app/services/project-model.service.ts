import {HttpClient} from '@angular/common/http';
import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {EServiceGenericService} from "@app/generics/e-service-generic-service";
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {ProjectModel} from "@app/models/project-model";
import {DialogService} from './dialog.service';
import {DynamicOptionsService} from './dynamic-options.service';
import {ProjectModelInterceptor} from "@app/model-interceptors/project-model-interceptor";
import {FactoryService} from "@app/services/factory.service";
import {UrlService} from "@app/services/url.service";
import {ProjectModelSearchCriteria} from "@app/models/project-model-search-criteria";

@Injectable({
  providedIn: 'root'
})
export class ProjectModelService extends EServiceGenericService<ProjectModel> {
  jsonSearchFile: string = 'external_project_models.json';
  serviceKey: keyof ILanguageKeys = 'menu_projects_models';
  interceptor: IModelInterceptor<ProjectModel> = new ProjectModelInterceptor();
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = ['fullSerial', 'domainInfo', 'caseStatus', 'projectTypeInfo', 'requestTypeInfo', 'createdOn', 'templateTypeInfo'];

  _getModel() {
    return ProjectModel;
  }

  _getServiceURL(): string {
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
              private urlService: UrlService,
              public cfr: ComponentFactoryResolver) {
    super();
    FactoryService.registerService('ProjectModelService', this);
  }
}
