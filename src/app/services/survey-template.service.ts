import {ComponentType} from '@angular/cdk/portal';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BackendWithDialogOperationsGenericService,} from '@app/generics/backend-with-dialog-operations-generic-service';
import {SurveyTemplate} from '@app/models/survey-template';
import {DialogService} from './dialog.service';
import {FactoryService} from '@app/services/factory.service';
import {UrlService} from '@app/services/url.service';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {SurveyTemplateInterceptor} from '@app/model-interceptors/survey-template-interceptor';
import {
  SurveyTemplatePopupComponent,
} from '@app/administration/popups/survey-template-popup/survey-template-popup.component';
import {SurveySectionService} from "@app/services/survey-section.service";
import {SurveyQuestionService} from "@app/services/survey-question.service";
import {ViewTraineeSurveyComponent} from "@app/shared/popups/view-trainee-survey/view-trainee-survey.component";
import {DialogRef} from "@app/shared/models/dialog-ref";

@Injectable({
  providedIn: 'root',
})
export class SurveyTemplateService extends BackendWithDialogOperationsGenericService<SurveyTemplate> {
  list: SurveyTemplate[] = [];
  interceptor: IModelInterceptor<SurveyTemplate> = new SurveyTemplateInterceptor();

  constructor(public dialog: DialogService,
              private _surveyQuestionService: SurveyQuestionService,
              private _surveySectionService: SurveySectionService,
              private urlService: UrlService,
              public http: HttpClient) {
    super();
    FactoryService.registerService('SurveyTemplateService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return SurveyTemplatePopupComponent;
  }

  _getModel() {
    return SurveyTemplate;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SURVEY_TEMPLATE;
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }

  viewTemplate(template: SurveyTemplate): DialogRef {
    return this.dialog.show(ViewTraineeSurveyComponent, {
      trainee: false,
      template: template,
      program: false,
      survey: false
    }, {
      fullscreen: true
    })
  }
}
