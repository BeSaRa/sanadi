import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {EServiceGenericService} from '../generics/e-service-generic-service';
import {InternationalCooperation} from '../models/international-cooperation';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {DocumentService} from './document.service';
import {CommentService} from './comment.service';
import {ActionLogService} from './action-log.service';
import {RecommendationService} from './recommendation.service';
import {ILanguageKeys} from '../interfaces/i-language-keys';
import {InternationalCooperationInterceptor} from '../model-interceptors/international-cooperation-interceptor';
import {UrlService} from './url.service';
import {DialogService} from './dialog.service';
import {DomSanitizer} from '@angular/platform-browser';
import {HttpClient} from '@angular/common/http';
import {FactoryService} from './factory.service';
import {SearchService} from './search.service';
import {InternationalCooperationSearchCriteria} from '../models/international-cooperation-search-criteria';
import {DynamicOptionsService} from './dynamic-options.service';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';

@Injectable({
  providedIn: 'root'
})
export class InternationalCooperationService extends EServiceGenericService<InternationalCooperation> {
  _getUrlService(): UrlService {
    return this.urlService;
  }

  searchColumns: string[] = ['fullSerial', 'createdOn', 'caseStatus', 'organization', 'fullName', 'creatorInfo'];
  caseStatusIconMap: Map<number, string> = new Map<number, string>([
    [CommonCaseStatus.CANCELLED, 'mdi mdi-cancel'],
    [CommonCaseStatus.DRAFT, 'mdi mdi-notebook-edit-outline'],
    [CommonCaseStatus.NEW, 'mdi mdi-file-star-outline'],
    [CommonCaseStatus.UNDER_PROCESSING, 'mdi mdi-rocket-launch'],
  ]);
  jsonSearchFile: string = 'international_cooperation_search_form.json';
  interceptor: IModelInterceptor<InternationalCooperation> = new InternationalCooperationInterceptor();
  documentService: DocumentService = new DocumentService(this);
  commentService: CommentService = new CommentService(this);
  actionLogService: ActionLogService = new ActionLogService(this);
  recommendationService: RecommendationService = new RecommendationService(this);
  searchService: SearchService = new SearchService(this);

  serviceKey: keyof ILanguageKeys = 'menu_international_cooperation';

  constructor(private urlService: UrlService,
              public dialog: DialogService,
              public cfr: ComponentFactoryResolver,
              public domSanitizer: DomSanitizer,
              public dynamicService: DynamicOptionsService,
              public http: HttpClient) {
    super();
    // register service
    FactoryService.registerService('InternationalCooperationService', this);
  }

  getCaseComponentName(): string {
    return 'InternationalCooperationComponent';
  }

  _getURLSegment(): string {
    return this.urlService.URLS.E_INTERNATIONAL_COOPERATION;
  }

  _getModel() {
    return InternationalCooperation;
  }

  _getInterceptor(): Partial<IModelInterceptor<InternationalCooperation>> {
    return this.interceptor;
  }

  getSearchCriteriaModel<S extends InternationalCooperation>(): InternationalCooperation {
    return new InternationalCooperationSearchCriteria();
  }
}
