import {Injectable} from '@angular/core';
import {UrlService} from './url.service';
import {Inquiry} from '../models/inquiry';
import {HttpClient} from '@angular/common/http';
import {CommentService} from './comment.service';
import {FactoryService} from './factory.service';
import {InquiryInterceptor} from '../model-interceptors/inquiry-interceptor';
import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {DocumentService} from './document.service';
import {DialogService} from './dialog.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ActionLogService} from './action-log.service';
import {RecommendationService} from './recommendation.service';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {SearchService} from './search.service';
import {InquirySearchCriteria} from '../models/inquiry-search-criteria';
import {DynamicOptionsService} from './dynamic-options.service';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {CastResponseContainer} from '@decorators/cast-response';

@CastResponseContainer({
  $default: {
    model: () => Inquiry
  }
})
@Injectable({
  providedIn: 'root'
})
export class InquiryService extends BaseGenericEService<Inquiry> {
  _getUrlService(): UrlService {
    return this.urlService;
  }

  searchColumns: string[] = ['fullSerial', 'createdOn', 'caseStatus', 'fullName', 'category', 'organization', 'creatorInfo'];
  caseStatusIconMap: Map<number, string> = new Map<number, string>([
    [CommonCaseStatus.CANCELLED, 'mdi mdi-cancel'],
    [CommonCaseStatus.DRAFT, 'mdi mdi-notebook-edit-outline'],
    [CommonCaseStatus.NEW, 'mdi mdi-file-star-outline'],
    [CommonCaseStatus.UNDER_PROCESSING, 'mdi mdi-rocket-launch'],
  ]);
  jsonSearchFile: string = 'inquiry_search_form.json';
  interceptor: IModelInterceptor<Inquiry> = new InquiryInterceptor();
  documentService: DocumentService = new DocumentService(this);
  commentService: CommentService = new CommentService(this);
  actionLogService: ActionLogService = new ActionLogService(this);
  recommendationService: RecommendationService = new RecommendationService(this);
  searchService: SearchService = new SearchService(this);
  serviceKey: keyof ILanguageKeys = 'menu_inquiries_and_complaints';

  constructor(private urlService: UrlService,
              public dialog: DialogService,
              public domSanitizer: DomSanitizer,
              public dynamicService: DynamicOptionsService,
              public http: HttpClient) {
    super();
    // register service
    FactoryService.registerService('InquiryService', this);
  }

  getCaseComponentName(): string {
    return 'InquiryComponent';
  }

  _getURLSegment(): string {
    return this.urlService.URLS.E_INQUIRY;
  }

  _getModel() {
    return Inquiry;
  }

  _getInterceptor(): Partial<IModelInterceptor<Inquiry>> {
    return this.interceptor;
  }

  getSearchCriteriaModel<S extends Inquiry>(): Inquiry {
    return new InquirySearchCriteria();
  }
}
