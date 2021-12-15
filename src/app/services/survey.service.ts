import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BackendGenericService} from "@app/generics/backend-generic-service";
import {Survey} from "@app/models/survey";
import {FactoryService} from "@app/services/factory.service";
import {UrlService} from "@app/services/url.service";
import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {SurveyInterceptor} from "@app/model-interceptors/survey-interceptor";
import {Observable} from "rxjs";
import {IDefaultResponse} from "@app/interfaces/idefault-response";
import {ISurveyInfo} from "@app/interfaces/isurvey-info";
import {map} from "rxjs/operators";
import {SurveyTemplate} from "@app/models/survey-template";
import {TrainingProgram} from "@app/models/training-program";
import {TrainingProgramService} from "@app/services/training-program.service";
import {TrainingProgramInterceptor} from "@app/model-interceptors/training-program-interceptor";
import {SurveyTemplateInterceptor} from "@app/model-interceptors/survey-template-interceptor";
import {Generator} from "@app/decorators/generator";
import {ExceptionHandlerService} from "@app/services/exception-handler.service";

@Injectable({
  providedIn: 'root'
})
export class SurveyService extends BackendGenericService<Survey> {
  list: Survey[] = [];
  interceptor: IModelInterceptor<Survey> = new SurveyInterceptor();
  trainingProgramInterceptor = new TrainingProgramInterceptor();
  surveyTemplateInterceptor = new SurveyTemplateInterceptor();

  constructor(public http: HttpClient,
              private trainingProgramService: TrainingProgramService,
              private exceptionHandlerService: ExceptionHandlerService,
              private urlService: UrlService) {
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

  loadSurveyInfoByToken(token: string): Observable<ISurveyInfo> {
    const params = new HttpParams({
      fromObject: {token}
    })
    this.exceptionHandlerService.excludeHandlingForMethodURL('GET', this._getServiceURL() + '/fetch/training-program?' + params)
    return this.http.get<IDefaultResponse<ISurveyInfo>>(this._getServiceURL() + '/fetch/training-program', {
      params: params
    })
      .pipe(map(response => response.rs))
      .pipe(map(info => {
        info.surveyTemplate = this.surveyTemplateInterceptor.receive(new SurveyTemplate().clone({...info.surveyTemplate}))
        info.trainingProgram = new TrainingProgram().clone({...info.trainingProgram})
        return info;
      }))
  }

  @Generator(undefined, true)
  private _loadSurveyByTraineeIdAndProgramId(traineeId: number, trainingProgramId: number): Observable<Survey[]> {
    return this.http.get<Survey[]>(this._getServiceURL() + '/criteria', {
      params: new HttpParams({
        fromObject: {traineeId, trainingProgramId}
      })
    })
  }

  loadSurveyByTraineeIdAndProgramId(traineeId: number, trainingProgramId: number): Observable<Survey> {
    return this._loadSurveyByTraineeIdAndProgramId(traineeId, trainingProgramId).pipe(map(result => result[0]));
  }

}
