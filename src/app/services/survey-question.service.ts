import {ComponentType} from '@angular/cdk/portal';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BackendWithDialogOperationsGenericService} from "@app/generics/backend-with-dialog-operations-generic-service";
import {SurveyQuestion} from "@app/models/survey-question";
import {DialogService} from './dialog.service';
import {FactoryService} from "@app/services/factory.service";
import {
  SurveyQuestionPopupComponent
} from "@app/administration/popups/survey-question-popup/survey-question-popup.component";
import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {SurveyQuestionInterceptor} from "@app/model-interceptors/survey-question-interceptor";
import {UrlService} from "@app/services/url.service";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {
  SelectQuestionPopupComponent
} from "@app/administration/popups/select-question-popup/select-question-popup.component";

@Injectable({
  providedIn: 'root'
})
export class SurveyQuestionService extends BackendWithDialogOperationsGenericService<SurveyQuestion> {
  list: SurveyQuestion[] = [];
  interceptor: IModelInterceptor<SurveyQuestion> = new SurveyQuestionInterceptor();

  _getDialogComponent(): ComponentType<any> {
    return SurveyQuestionPopupComponent;
  }


  _getModel() {
    return SurveyQuestion;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SURVEY_QUESTION;
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }

  constructor(public dialog: DialogService, private urlService: UrlService, public http: HttpClient) {
    super();
    FactoryService.registerService('SurveyQuestionService', this);
  }

  openSelectQuestion(questions: SurveyQuestion[], selectedQuestionIds: number[]): DialogRef {
    return this.dialog.show(SelectQuestionPopupComponent, {
      questions,
      selectedQuestionIds
    });
  }
}
