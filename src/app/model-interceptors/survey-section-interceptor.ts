import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {SurveySection} from "@app/models/survey-section";
import {SurveyQuestionInterceptor} from "@app/model-interceptors/survey-question-interceptor";
import {SurveyQuestion} from "@app/models/survey-question";

export class SurveySectionInterceptor implements IModelInterceptor<SurveySection> {
  static questionInterceptor = new SurveyQuestionInterceptor();

  send(model: Partial<SurveySection>): Partial<SurveySection> {
    delete model.langService;
    delete model.service;
    delete model.searchFields;
    model.questionSet = model.questionSet?.map((item) => {
      item.question = SurveySectionInterceptor.questionInterceptor.send(item.question) as SurveyQuestion;
      return item;
    })
    return model;
  }

  receive(model: SurveySection): SurveySection {
    return model;
  }
}
