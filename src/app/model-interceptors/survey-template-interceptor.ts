import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { SurveySection } from '@app/models/survey-section';
import { SurveyTemplate } from '@app/models/survey-template';

export class SurveyTemplateInterceptor implements IModelInterceptor<SurveyTemplate> {
  send(model: Partial<SurveyTemplate>): Partial<SurveyTemplate> {
    return model;
  }

  receive(model: SurveyTemplate): SurveyTemplate {
    model.questionSet.forEach((item) => model.sections = model.sections.concat([new SurveySection().clone({ ...item.section })]));
    console.log(model.sections);
    return model;
  }
}
