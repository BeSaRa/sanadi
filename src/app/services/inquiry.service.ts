import {Injectable} from '@angular/core';
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

@Injectable({
  providedIn: 'root'
})
export class InquiryService extends EServiceGenericService<Inquiry, InquiryService> {
  private interceptor: IModelInterceptor<Inquiry> = new InquiryInterceptor();
  documentService: DocumentService<InquiryService> = new DocumentService<InquiryService>(this);
  commentService: CommentService<InquiryService> = new CommentService<InquiryService>(this);
  actionLogService: ActionLogService<InquiryService> = new ActionLogService<InquiryService>(this);
  recommendationService: RecommendationService<InquiryService> = new RecommendationService<InquiryService>(this);

  constructor(private urlService: UrlService,
              public dialog: DialogService,
              public domSanitizer: DomSanitizer,
              public http: HttpClient) {
    super();
    // register service
    FactoryService.registerService('InquiryService', this);
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
