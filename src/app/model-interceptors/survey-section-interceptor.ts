import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {SurveySection} from "@app/models/survey-section";

export class SurveySectionInterceptor implements IModelInterceptor<SurveySection> {
  send(model: Partial<SurveySection>): Partial<SurveySection> {
    delete model.langService;
    delete model.service;
    delete model.searchFields;
    return model;
  }

  receive(model: SurveySection): SurveySection {
    return model;
  }
}
