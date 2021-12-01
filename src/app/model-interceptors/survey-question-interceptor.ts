import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {SurveyQuestion} from "@app/models/survey-question";

export class SurveyQuestionInterceptor implements IModelInterceptor<SurveyQuestion> {
  send(model: Partial<SurveyQuestion>): Partial<SurveyQuestion> {
    return model;
  }

  receive(model: SurveyQuestion): SurveyQuestion {
    return model;
  }
}
