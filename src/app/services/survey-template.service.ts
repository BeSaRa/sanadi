import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SurveyTemplate } from '@app/models/survey-template';
import { DialogService } from './dialog.service';
import { FactoryService } from '@app/services/factory.service';
import { UrlService } from '@app/services/url.service';
import {
  SurveyTemplatePopupComponent,
} from '@app/administration/popups/survey-template-popup/survey-template-popup.component';
import { SurveySectionService } from "@app/services/survey-section.service";
import { SurveyQuestionService } from "@app/services/survey-question.service";
import { ViewTraineeSurveyComponent } from "@app/shared/popups/view-trainee-survey/view-trainee-survey.component";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";

@CastResponseContainer({
  $default: {
    model: () => SurveyTemplate
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => SurveyTemplate }
  }
})
@Injectable({
  providedIn: 'root',
})
export class SurveyTemplateService extends CrudWithDialogGenericService<SurveyTemplate> {
  list: SurveyTemplate[] = [];

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

  _getServiceURL(): string {
    return this.urlService.URLS.SURVEY_TEMPLATE;
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
