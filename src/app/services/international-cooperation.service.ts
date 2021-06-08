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

@Injectable({
  providedIn: 'root'
})
export class InternationalCooperationService extends EServiceGenericService<InternationalCooperation> {
  interceptor: IModelInterceptor<InternationalCooperation> = new InternationalCooperationInterceptor();
  documentService: DocumentService = new DocumentService(this);
  commentService: CommentService = new CommentService(this);
  actionLogService: ActionLogService = new ActionLogService(this);
  recommendationService: RecommendationService = new RecommendationService(this);

  serviceKey: keyof ILanguageKeys = 'menu_international_cooperation';
  constructor(private urlService: UrlService,
              public dialog: DialogService,
              public cfr: ComponentFactoryResolver,
              public domSanitizer: DomSanitizer,
              public http: HttpClient) {
    super();
    // register service
    FactoryService.registerService('InternationalCooperationService', this);
  }

  getCaseComponentName(): string {
    return 'InternationalCooperationComponent';
  }

  _getServiceURL(): string {
    return this.urlService.URLS.E_INTERNATIONAL_COOPERATION;
  }

  _getModel() {
    return InternationalCooperation;
  }

  _getInterceptor(): Partial<IModelInterceptor<InternationalCooperation>> {
    return this.interceptor;
  }
}
