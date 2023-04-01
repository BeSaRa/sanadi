import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {SurveyTemplate} from '@app/models/survey-template';
import {SurveySectionInterceptor} from "@app/model-interceptors/survey-section-interceptor";
import {SurveySection} from "@app/models/survey-section";
import {SurveyQuestion} from "@app/models/survey-question";
import {LookupService} from '@services/lookup.service';

export class SurveyTemplateInterceptor implements IModelInterceptor<SurveyTemplate> {
  static sectionInterceptor = new SurveySectionInterceptor();

  send(model: Partial<SurveyTemplate>): Partial<SurveyTemplate> {
    model.sectionSet = model.sectionSet?.map((item) => {
      return SurveyTemplateInterceptor.sectionInterceptor.send(item) as SurveySection;
    });
    delete model.lookupService;
    return model;
  }

  receive(model: SurveyTemplate): SurveyTemplate {
    model.sectionSet = model.sectionSet.map((item) => {
      const section = new SurveySection().clone({...item});
      section.questionSet.map((q) => {
        q.question = new SurveyQuestion().clone({...q.question});
        return q
      });
      return section;
    });
    return model.sortSectionsAndQuestions();
  }
}
