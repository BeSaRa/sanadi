import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {SubventionAid} from '../models/subvention-aid';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';
import {SubventionAidInterceptor} from '../model-interceptors/subvention-aid-interceptor';

@Injectable({
  providedIn: 'root'
})
export class SubventionAidService extends BackendGenericService<SubventionAid> {
  list!: SubventionAid[];
  interceptor: SubventionAidInterceptor = new SubventionAidInterceptor();

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('SubventionAidService', this);
  }

  _getModel(): any {
    return SubventionAid;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_AID;
  }
}
