import {Injectable} from '@angular/core';
import {Consultation} from '../models/consultation';
import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {ActionLogService} from './action-log.service';
import {CommentService} from './comment.service';
import {DialogService} from './dialog.service';
import {DocumentService} from './document.service';
import {DomSanitizer} from '@angular/platform-browser';
import {HttpClient} from '@angular/common/http';
import {RecommendationService} from './recommendation.service';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {UrlService} from './url.service';
import {ConsultationInterceptor} from '../model-interceptors/consultation-interceptor';
import {FactoryService} from './factory.service';
import {SearchService} from './search.service';
import {ConsultationSearchCriteria} from '../models/consultation-search-criteria';
import {DynamicOptionsService} from './dynamic-options.service';
import {BaseGenericEService} from "@app/generics/base-generic-e-service";
import {CastResponseContainer} from "@decorators/cast-response";
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';

@CastResponseContainer({
  $default: {
    model: ()=> Consultation,
  }
})
@Injectable({
  providedIn: 'root'
})
export class ConsultationService extends BaseGenericEService<Consultation> {
  _getUrlService(): UrlService {
    return this.urlService;
  }

  searchColumns: string[] = ['fullSerial', 'createdOn', 'caseStatus', 'organizationId', 'fullName', 'category', 'creatorInfo'];
  caseStatusIconMap: Map<number, string> = new Map<number, string>([
    [CommonCaseStatus.CANCELLED, 'mdi mdi-cancel'],
    [CommonCaseStatus.DRAFT, 'mdi mdi-notebook-edit-outline'],
    [CommonCaseStatus.NEW, 'mdi mdi-file-star-outline'],
    [CommonCaseStatus.UNDER_PROCESSING, 'mdi mdi-rocket-launch'],
  ]);

  jsonSearchFile: string = 'consultation_search_form.json';
  interceptor: IModelInterceptor<Consultation> = new ConsultationInterceptor();
  actionLogService: ActionLogService = new ActionLogService(this);
  commentService: CommentService = new CommentService(this);
  documentService: DocumentService = new DocumentService(this);
  recommendationService: RecommendationService = new RecommendationService(this);
  searchService: SearchService = new SearchService(this);
  serviceKey: keyof ILanguageKeys = 'menu_consultations';


  constructor(private urlService: UrlService,
              public domSanitizer: DomSanitizer,
              public dialog: DialogService,
              public dynamicService: DynamicOptionsService,
              public http: HttpClient) {
    super();
    FactoryService.registerService('ConsultationService', this);
  }


  getCaseComponentName(): string {
    return 'ConsultationComponent';
  }

  _getInterceptor(): Partial<IModelInterceptor<Consultation>> {
    return this.interceptor;
  }

  _getModel() {
    return Consultation;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.E_CONSULTATION;
  }

  getSearchCriteriaModel<S extends Consultation>(): Consultation {
    return new ConsultationSearchCriteria();
  }

}
