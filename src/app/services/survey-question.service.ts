import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SurveyQuestion } from "@app/models/survey-question";
import { DialogService } from './dialog.service';
import { FactoryService } from "@app/services/factory.service";
import {
  SurveyQuestionPopupComponent
} from "@app/administration/popups/survey-question-popup/survey-question-popup.component";
import { UrlService } from "@app/services/url.service";
import { DialogRef } from "@app/shared/models/dialog-ref";
import {
  SelectQuestionPopupComponent
} from "@app/administration/popups/select-question-popup/select-question-popup.component";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";

@CastResponseContainer({
  $default: {
    model: () => SurveyQuestion
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => SurveyQuestion }
  }
})
@Injectable({
  providedIn: 'root'
})
export class SurveyQuestionService extends CrudWithDialogGenericService<SurveyQuestion> {
  list: SurveyQuestion[] = [];

  _getDialogComponent(): ComponentType<any> {
    return SurveyQuestionPopupComponent;
  }


  _getModel() {
    return SurveyQuestion;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SURVEY_QUESTION;
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
