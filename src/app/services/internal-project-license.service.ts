import { Injectable } from '@angular/core';
import { FactoryService } from '@app/services/factory.service';
import { InternalProjectLicense } from '@app/models/internal-project-license';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@app/services/url.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService } from '@app/services/dialog.service';
import { DynamicOptionsService } from '@app/services/dynamic-options.service';
import { CommentService } from '@app/services/comment.service';
import { DocumentService } from '@app/services/document.service';
import { RecommendationService } from '@app/services/recommendation.service';
import { SearchService } from '@app/services/search.service';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { InternalProjectLicenseInterceptor } from '@app/model-interceptors/internal-project-license-interceptor';
import { InternalProjectLicenseSearchCriteria } from '@app/models/internal-project-license-search-criteria';
import { Observable } from 'rxjs';
import { LicenseService } from '@app/services/license.service';
import { InternalProjectLicenseResult } from '@app/models/internal-project-license-result';
import { ProjectComponent } from '@app/models/project-component';
import { ProjectComponentInterceptor } from '@app/model-interceptors/project-component-interceptor';
import { SearchInternalProjectLicenseCriteria } from '@app/models/search-internal-project-license-criteria';
import { CastResponseContainer } from "@decorators/cast-response";
import { BaseGenericEService } from "@app/generics/base-generic-e-service";

@CastResponseContainer({
  $default: {
    model: () => InternalProjectLicense
  }
})
@Injectable({
  providedIn: 'root'
})
export class InternalProjectLicenseService extends BaseGenericEService<InternalProjectLicense> {
  _getUrlService(): UrlService {
    return this.urlService;
  }
  searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'createdOn', 'caseStatus', 'projectName', 'ouInfo'];
  selectLicenseDisplayColumns: string[] = ['arName', 'enName', 'fullSerial', 'status', 'endDate', 'actions'];
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  interceptor: IModelInterceptor<InternalProjectLicense> = new InternalProjectLicenseInterceptor();
  projectComponentInterceptor: IModelInterceptor<ProjectComponent> = new ProjectComponentInterceptor();
  jsonSearchFile: string = 'internal_project_license_search_form.json';
  commentService: CommentService = new CommentService(this);
  documentService: DocumentService = new DocumentService(this);
  recommendationService: RecommendationService = new RecommendationService(this);
  searchService: SearchService = new SearchService(this);
  serviceKey: keyof ILanguageKeys = 'menu_internal_project_license';

  constructor(private urlService: UrlService,
              public domSanitizer: DomSanitizer,
              public dialog: DialogService,
              public dynamicService: DynamicOptionsService,
              private licenseService: LicenseService,
              public http: HttpClient) {
    super();
    FactoryService.registerService('InternalProjectLicenseService', this);
  }

  _getInterceptor(): Partial<IModelInterceptor<InternalProjectLicense>> {
    return this.interceptor;
  }

  _getModel(): any {
    return InternalProjectLicense;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.INTERNAL_PROJECT_LICENSE;
  }

  getCaseComponentName(): string {
    return 'InternalProjectLicenseComponent';
  }

  getSearchCriteriaModel<S extends InternalProjectLicense>(): InternalProjectLicense {
    return new SearchInternalProjectLicenseCriteria();
  }

  licenseSearch(criteria: Partial<InternalProjectLicenseSearchCriteria> = {}): Observable<InternalProjectLicenseResult[]> {
    return this.licenseService.internalProjectLicenseSearch(criteria);
  }
}
