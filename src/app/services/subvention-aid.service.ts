import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {SubventionAid} from '../models/subvention-aid';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';
import {SubventionAidInterceptor} from '../model-interceptors/subvention-aid-interceptor';
import {Generator} from '../decorators/generator';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubventionAidService extends BackendGenericService<SubventionAid> {
  list!: SubventionAid[];

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('SubventionAidService', this);
  }

  _getModel(): any {
    return SubventionAid;
  }

  _getReceiveInterceptor(): any {
    return SubventionAidInterceptor.receive;
  }

  _getSendInterceptor(): any {
    return SubventionAidInterceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_AID;
  }

  @Generator(undefined, true)
  private _loadByCriteria(criteria: { benId?: any, requestId?: any }): Observable<SubventionAid[]> {
    return this.http.get<SubventionAid[]>(this._getServiceURL() + '/criteria', {
      params: new HttpParams({
        fromObject: criteria
      })
    });
  }

  loadByCriteria(criteria: { benId?: any, requestId?: any }): Observable<SubventionAid[]> {
    return this._loadByCriteria(criteria);
  }
}
