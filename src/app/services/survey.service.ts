import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Survey } from "@app/models/survey";
import { FactoryService } from "@app/services/factory.service";
import { UrlService } from "@app/services/url.service";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { SurveyInterceptor } from "@app/model-interceptors/survey-interceptor";
import { Observable } from "rxjs";
import { IDefaultResponse } from "@app/interfaces/idefault-response";
import { ISurveyInfo } from "@app/interfaces/isurvey-info";
import { map } from "rxjs/operators";
import { SurveyTemplate } from "@app/models/survey-template";
import { TrainingProgram } from "@app/models/training-program";
import { TrainingProgramService } from "@app/services/training-program.service";
import { SurveyTemplateInterceptor } from "@app/model-interceptors/survey-template-interceptor";
import { ExceptionHandlerService } from "@app/services/exception-handler.service";
import { BlobModel } from "@app/models/blob-model";
import { DomSanitizer } from "@angular/platform-browser";
import { TokenService } from "@app/services/token.service";
import { CrudGenericService } from "@app/generics/crud-generic-service";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";
import { HasInterception, InterceptParam } from "@decorators/intercept-model";
import {SURVEY_TOKEN} from "@app/http-context/tokens";

@CastResponseContainer({
  $default: {
    model: () => Survey
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => Survey }
  }
})
@Injectable({
  providedIn: 'root'
})
export class SurveyService extends CrudGenericService<Survey> {
  list: Survey[] = [];
  interceptor: IModelInterceptor<Survey> = new SurveyInterceptor();
  // trainingProgramInterceptor = new TrainingProgramInterceptor();
  surveyTemplateInterceptor = new SurveyTemplateInterceptor();

  constructor(public http: HttpClient,
    private trainingProgramService: TrainingProgramService,
    private exceptionHandlerService: ExceptionHandlerService,
    private tokenService: TokenService,
    private domSanitizer: DomSanitizer,
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

  loadSurveyInfoByToken(token: string, authToken?: string): Observable<ISurveyInfo> {
    const params = new HttpParams({
      fromObject: { token }
    })
    this.exceptionHandlerService.excludeHandlingForMethodURL('GET', this._getServiceURL() + '/fetch/training-program?' + params)
    return this.http.get<IDefaultResponse<ISurveyInfo>>(this._getServiceURL() + '/fetch/training-program', {
      params: params,
      context: (new HttpContext().set(SURVEY_TOKEN, authToken ? authToken : this.tokenService.getToken()))
    })
      .pipe(map(response => response.rs))
      .pipe(map(info => {
        info.surveyTemplate = this.surveyTemplateInterceptor.receive(new SurveyTemplate().clone({ ...info.surveyTemplate }))
        info.trainingProgram = new TrainingProgram().clone({ ...info.trainingProgram })
        return info;
      }))
  }

  @CastResponse(undefined)
  private _loadSurveyByTraineeIdAndProgramId(traineeId: number, trainingProgramId: number, authToken?: string): Observable<Survey[]> {
    return this.http.get<Survey[]>(this._getServiceURL() + '/criteria', {
      params: new HttpParams({
        fromObject: { traineeId, trainingProgramId }
      }),
      context: (new HttpContext().set(SURVEY_TOKEN, authToken ? authToken : this.tokenService.getToken()))
    })
  }

  loadSurveyByTraineeIdAndProgramId(traineeId: number, trainingProgramId: number, authToken?: string): Observable<Survey> {
    return this._loadSurveyByTraineeIdAndProgramId(traineeId, trainingProgramId, authToken).pipe(map(result => result[0]));
  }

  printReport(programId: number, exportType = 'pdf'): Observable<BlobModel> {
    return this.http.get(this._getServiceURL() + `/stats/${programId}/export`, {
      params: new HttpParams({
        fromObject: {
          exportType
        }
      }),
      observe: 'body',
      responseType: 'blob'
    }).pipe(map(blob => new BlobModel(blob, this.domSanitizer)));
  }

  @HasInterception
  @CastResponse(undefined)
  create(@InterceptParam() model: Survey, authToken?: string): Observable<Survey> {
    return this.http.post<Survey>(this._getServiceURL() + '/full', model, {
      context: (new HttpContext().set(SURVEY_TOKEN, authToken ? authToken : this.tokenService.getToken()))
    });
  }

  @HasInterception
  @CastResponse(undefined)
  update(@InterceptParam() model: Survey, authToken?: string): Observable<Survey> {
    return this.http.put<Survey>(this._getServiceURL() + '/full', model, {
      context: (new HttpContext().set(SURVEY_TOKEN, authToken ? authToken : this.tokenService.getToken()))
    });
  }
}
