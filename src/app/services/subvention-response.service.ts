import { Injectable } from '@angular/core';
import {FactoryService} from './factory.service';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {SubventionResponse} from '../models/subvention-response';
import {SubventionResponseInterceptor} from '../model-interceptors/subvention-response-interceptor';
import {Generator} from '../decorators/generator';
import {Observable} from 'rxjs';
import {InterceptParam, SendInterceptor} from '../decorators/model-interceptor';

@Injectable({
  providedIn: 'root'
})
export class SubventionResponseService {

  constructor(public http: HttpClient,
              private urlService: UrlService) {
    FactoryService.registerService('SubventionResponseService', this);
  }


  _getModel(): any {
    return SubventionResponse;
  }

  _getSendInterceptor(): any {
    return SubventionResponseInterceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_REQUEST;
  }

  _getReceiveInterceptor(): any {
    return SubventionResponseInterceptor.receive;
  }

  _getPartialRequestServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_REQUEST_PARTIAL;
  }

  @Generator(undefined, false, {property: 'rs'})
  loadById(requestId: number): Observable<SubventionResponse> {
    return this.http.get<SubventionResponse>(this._getServiceURL() + '/full/' + requestId);
  }

  @Generator(undefined, false, {property: 'rs'})
  loadPartialRequestById(id: number): Observable<SubventionResponse> {
    return this.http.get<SubventionResponse>(this._getPartialRequestServiceURL() + '/' + id);
  }

  @Generator(undefined, false, {property: 'rs'})
  createPartialRequestById(id: number): Observable<SubventionResponse> {
    return this.http.put<SubventionResponse>(this._getPartialRequestServiceURL() + '/create/' + id, {});
  }

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  savePartialRequest(@InterceptParam() data: SubventionResponse): Observable<SubventionResponse> {
    return this.http.post<SubventionResponse>(this._getPartialRequestServiceURL(), data);
  }
}
