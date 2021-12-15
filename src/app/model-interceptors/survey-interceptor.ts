import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {Survey} from "@app/models/survey";
import {SurveyAnswer} from "@app/models/survey-answer";

export class SurveyInterceptor implements IModelInterceptor<Survey> {
  send(model: Partial<Survey>): Partial<Survey> {
    delete model.enName;
    delete model.arName;
    delete model.searchFields;
    return model;
  }

  receive(model: Survey): Survey {
    model.answerSet = model.answerSet.map(answer => new SurveyAnswer().clone({...answer}))
    return model;
  }
}
