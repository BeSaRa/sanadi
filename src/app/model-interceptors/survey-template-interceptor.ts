import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {SurveyTemplate} from '@app/models/survey-template';
import {SurveySectionInterceptor} from "@app/model-interceptors/survey-section-interceptor";
import {SurveySection} from "@app/models/survey-section";

export class SurveyTemplateInterceptor implements IModelInterceptor<SurveyTemplate> {
  static sectionInterceptor = new SurveySectionInterceptor();

  send(model: Partial<SurveyTemplate>): Partial<SurveyTemplate> {
    model.sectionSet = model.sectionSet?.map((item) => {
      return SurveyTemplateInterceptor.sectionInterceptor.send(item) as SurveySection;
    });
    return model;
  }

  receive(model: SurveyTemplate): SurveyTemplate {
    model.sectionSet = model.sectionSet.map((item) => new SurveySection().clone({...item}))
    return model;
  }
}
