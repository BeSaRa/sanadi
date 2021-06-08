import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {EServiceGenericService} from '../generics/e-service-generic-service';
import {UrlService} from './url.service';
import {Inquiry} from '../models/inquiry';
import {HttpClient} from '@angular/common/http';
import {CommentService} from './comment.service';
import {FactoryService} from './factory.service';
import {InquiryInterceptor} from '../model-interceptors/inquiry-interceptor';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {DocumentService} from './document.service';
import {DialogService} from './dialog.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ActionLogService} from './action-log.service';
import {RecommendationService} from './recommendation.service';
import {ILanguageKeys} from '../interfaces/i-language-keys';

@Injectable({
  providedIn: 'root'
})
export class InquiryService extends EServiceGenericService<Inquiry> {
  interceptor: IModelInterceptor<Inquiry> = new InquiryInterceptor();
  documentService: DocumentService = new DocumentService(this);
  commentService: CommentService = new CommentService(this);
  actionLogService: ActionLogService = new ActionLogService(this);
  recommendationService: RecommendationService = new RecommendationService(this);

  serviceKey: keyof ILanguageKeys = 'menu_inquiries_and_complaints';

  constructor(private urlService: UrlService,
              public dialog: DialogService,
              public cfr: ComponentFactoryResolver,
              public domSanitizer: DomSanitizer,
              public http: HttpClient) {
    super();
    // register service
    FactoryService.registerService('InquiryService', this);
  }

  getCaseComponentName(): string {
    return 'InquiryComponent';
  }

  _getServiceURL(): string {
    return this.urlService.URLS.E_INQUIRY;
  }

  _getModel() {
    return Inquiry;
  }

  _getInterceptor(): Partial<IModelInterceptor<Inquiry>> {
    return this.interceptor;
  }
}
