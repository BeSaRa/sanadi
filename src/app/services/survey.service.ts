import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BackendGenericService} from "@app/generics/backend-generic-service";
import {Survey} from "@app/models/survey";
import {FactoryService} from "@app/services/factory.service";
import {UrlService} from "@app/services/url.service";
import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {SurveyInterceptor} from "@app/model-interceptors/survey-interceptor";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SurveyService extends BackendGenericService<Survey> {
  list: Survey[] = [];
  interceptor: IModelInterceptor<Survey> = new SurveyInterceptor();

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('SurveyService', this);
  }

  _getModel() {
    return Survey;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SURVEY;
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }

  publishSurvey(trainingProgramId: number, trainingTemplateId: number): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + `/publish/training-program/${trainingProgramId}/template-id/${trainingTemplateId}`, {})
  }
}
