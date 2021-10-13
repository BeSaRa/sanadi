import {Injectable} from '@angular/core';
import {CustomTerm} from "@app/models/custom-term";
import {HttpClient} from "@angular/common/http";
import {UrlService} from "@app/services/url.service";
import {DialogService} from "@app/services/dialog.service";
import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {CustomTermInterceptor} from "@app/model-interceptors/custom-term-interceptor";
import {Generator} from "@app/decorators/generator";
import {Observable} from "rxjs";
import {FactoryService} from "@app/services/factory.service";
import {InterceptParam, SendInterceptor} from "@app/decorators/model-interceptor";

@Injectable({
  providedIn: 'root'
})
export class CustomTermService {
  list: CustomTerm[] = [];
  interceptor: IModelInterceptor<CustomTerm> = new CustomTermInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private dialogService: DialogService) {
   // super();
    FactoryService.registerService('CustomTermService', this);
  }

  _getModel(): any {
    return CustomTerm;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.CUSTOM_TERMS;
  }

  @Generator(undefined, true, {property: 'rs'})
  loadByCaseType(caseType: number): Observable<CustomTerm[]> {
    return this.http.get<CustomTerm[]>(this._getServiceURL() + '/service/' + caseType);
  }

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  create(@InterceptParam() model: CustomTerm): Observable<CustomTerm> {
    return this.http.post<CustomTerm>(this._getServiceURL(), model);
  }

  @SendInterceptor()
  update(@InterceptParam() model: CustomTerm): Observable<CustomTerm> {
    return this._update(model);
  }

  @Generator(undefined, false, {property: 'rs'})
  private _update(model: CustomTerm): Observable<CustomTerm> {
    return this.http.put<CustomTerm>(this._getServiceURL(), model);
  }

  delete(modelId: number): Observable<boolean> {
    return this.http.delete<boolean>(this._getServiceURL() + '/' + modelId);
  }
}
