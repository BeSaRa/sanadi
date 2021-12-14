import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {Survey} from "@app/models/survey";

export class SurveyInterceptor implements IModelInterceptor<Survey> {
  send(model: Partial<Survey>): Partial<Survey> {
    return model;
  }

  receive(model: Survey): Survey {
    return model;
  }
}
