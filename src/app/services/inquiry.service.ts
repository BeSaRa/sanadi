import {Injectable} from '@angular/core';
import {EServiceGenericService} from '../generics/e-service-generic-service';
import {UrlService} from './url.service';
import {Inquiry} from '../models/inquiry';
import {HttpClient} from '@angular/common/http';
import {CommentService} from './comment.service';
import {FactoryService} from './factory.service';
import {InquiryInterceptor} from '../model-interceptors/inquiry-interceptor';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';

@Injectable({
  providedIn: 'root'
})
export class InquiryService extends EServiceGenericService<Inquiry, InquiryService> {
  commentService: CommentService<InquiryService> = new CommentService<InquiryService>(this);

  constructor(private urlService: UrlService,
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
    return new InquiryInterceptor();
  }
}
