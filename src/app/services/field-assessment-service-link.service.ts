import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FactoryService } from "@app/services/factory.service";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { UrlService } from "@app/services/url.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { IDefaultResponse } from "@app/interfaces/idefault-response";
import { CrudGenericService } from "@app/generics/crud-generic-service";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";
import { HasInterception, InterceptParam } from "@decorators/intercept-model";
import { FieldAssessmentServiceLink } from '@app/models/field-assessment-service';
import { FieldAssessmentServiceLinkInterceptor } from '@app/model-interceptors/field-assessment-service-interceptor';

@CastResponseContainer({
  $default: {
    model: () => FieldAssessmentServiceLink
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => FieldAssessmentServiceLink }
  }
})
@Injectable({
  providedIn: 'root'
})
export class FieldAssessmentServiceLinkService extends CrudGenericService<FieldAssessmentServiceLink> {
  list: FieldAssessmentServiceLink[] = [];
  interceptor: IModelInterceptor<FieldAssessmentServiceLink> = new FieldAssessmentServiceLinkInterceptor();

  _getModel() {
    return FieldAssessmentServiceLink;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.FIELD_ASSESSMENT_SERVICE
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('FieldAssessmentServiceLinkService', this);
  }

  @CastResponse(undefined)
  loadFieldAssessmentServiceLinkById(FieldId: number): Observable<FieldAssessmentServiceLink[]> {
    return this.http.get<FieldAssessmentServiceLink[]>(this._getServiceURL() + '/field-assessment/' + FieldId)
  }

  @HasInterception
  @CastResponse(undefined)
  createFieldAssessmentServiceLink(model: {fieldAssessmentId: number, serviceId: number}): Observable<FieldAssessmentServiceLink> {
    return this.http.post<FieldAssessmentServiceLink>(this.urlService.URLS.FIELD_ASSESSMENT_SERVICE + '/full', model);
  }

  deleteBulk(FieldAssessmentServiceLinkIds: number[]): Observable<Record<number, boolean>> {
    return this.http.request<IDefaultResponse<Record<number, boolean>>>('DELETE', this.urlService.URLS.FIELD_ASSESSMENT_SERVICE + '/bulk', {
      body: FieldAssessmentServiceLinkIds
    }).pipe(map(res => res.rs));
  }
}
