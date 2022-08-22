import { Injectable } from '@angular/core';
import { FactoryService } from '@app/services/factory.service';
import { ExternalProjectImplementation } from '@app/models/external-project-implementation';
import { UrlService } from '@app/services/url.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService } from '@app/services/dialog.service';
import { DynamicOptionsService } from '@app/services/dynamic-options.service';
import { LicenseService } from '@app/services/license.service';
import { HttpClient } from '@angular/common/http';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { CommentService } from '@app/services/comment.service';
import { DocumentService } from '@app/services/document.service';
import { RecommendationService } from '@app/services/recommendation.service';
import { SearchService } from '@app/services/search.service';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import {
  ExternalProjectImplementationInterceptor
} from '@app/model-interceptors/external-project-implementation-interceptor';
import { ImplementationTemplate } from '@app/models/implementation-template';
import { ImplementationTemplateInterceptor } from '@app/model-interceptors/implementation-template-interceptor';
import { FundingSource } from '@app/models/funding-source';
import { FundingSourceInterceptor } from '@app/model-interceptors/funding-source-interceptor';
import { Payment } from '@app/models/payment';
import { PaymentInterceptor } from '@app/model-interceptors/payment-interceptor';
import {
  SearchExternalProjectImplementationCriteria
} from '@app/models/search-external-project-implementation-criteria';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";
import { CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: {
    model: () => ExternalProjectImplementation
  }
})
@Injectable({
  providedIn: 'root'
})
export class ExternalProjectImplementationService extends BaseGenericEService<ExternalProjectImplementation> {

  constructor(private urlService: UrlService,
              public domSanitizer: DomSanitizer,
              public dialog: DialogService,
              public dynamicService: DynamicOptionsService,
              private _licenseService: LicenseService,
              public http: HttpClient) {
    super();
    FactoryService.registerService('ExternalProjectImplementationService', this);
  }

  searchColumns: string[] = ['fullSerial', 'createdOn', 'caseStatus', 'projectName', 'ouInfo'];
  selectLicenseDisplayColumns: string[] = ['arName', 'enName', 'fullSerial', 'status', 'endDate', 'actions'];
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  interceptor: IModelInterceptor<ExternalProjectImplementation> = new ExternalProjectImplementationInterceptor();
  implementationTemplateInterceptor: IModelInterceptor<ImplementationTemplate> = new ImplementationTemplateInterceptor();
  fundingSourceInterceptor: IModelInterceptor<FundingSource> = new FundingSourceInterceptor();
  paymentInterceptor: IModelInterceptor<Payment> = new PaymentInterceptor();
  jsonSearchFile: string = 'external_project_implementation_search_form.json';
  commentService: CommentService = new CommentService(this);
  documentService: DocumentService = new DocumentService(this);
  recommendationService: RecommendationService = new RecommendationService(this);
  searchService: SearchService = new SearchService(this);
  serviceKey: keyof ILanguageKeys = 'menu_external_project_implementation';

  _getUrlService(): UrlService {
    return this.urlService;
  }

  _getInterceptor(): Partial<IModelInterceptor<ExternalProjectImplementation>> {
    return this.interceptor;
  }

  _getModel(): any {
    return ExternalProjectImplementation;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.EXTERNAL_PROJECT_IMPLEMENTATION;
  }

  getCaseComponentName(): string {
    return 'ExternalProjectImplementationComponent';
  }

  getSearchCriteriaModel<S extends ExternalProjectImplementation>(): ExternalProjectImplementation {
    return new SearchExternalProjectImplementationCriteria();
  }
}
