import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {EServiceGenericService} from '../generics/e-service-generic-service';
import {Consultation} from '../models/consultation';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {ActionLogService} from './action-log.service';
import {CommentService} from './comment.service';
import {DialogService} from './dialog.service';
import {DocumentService} from './document.service';
import {DomSanitizer} from '@angular/platform-browser';
import {HttpClient} from '@angular/common/http';
import {RecommendationService} from './recommendation.service';
import {ILanguageKeys} from '../interfaces/i-language-keys';
import {UrlService} from './url.service';
import {ConsultationInterceptor} from '../model-interceptors/consultation-interceptor';
import {FactoryService} from './factory.service';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService extends EServiceGenericService<Consultation> {
  interceptor: IModelInterceptor<Consultation> = new ConsultationInterceptor();
  actionLogService: ActionLogService = new ActionLogService(this);
  commentService: CommentService = new CommentService(this);
  documentService: DocumentService = new DocumentService(this);
  recommendationService: RecommendationService = new RecommendationService(this);
  serviceKey: keyof ILanguageKeys = 'menu_consultations';

  constructor(private urlService: UrlService,
              public domSanitizer: DomSanitizer,
              public cfr: ComponentFactoryResolver,
              public dialog: DialogService,
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

  _getServiceURL(): string {
    return this.urlService.URLS.E_CONSULTATION;
  }

}
