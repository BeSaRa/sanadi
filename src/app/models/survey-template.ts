import { BaseModel } from '@app/models/base-model';
import { SurveyTemplateService } from '@app/services/survey-template.service';
import { FactoryService } from '@app/services/factory.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { ITemplateQuestionSection } from '@app/interfaces/itemplate-question-section';
import { SurveySection } from '@app/models/survey-section';

export class SurveyTemplate extends BaseModel<SurveyTemplate, SurveyTemplateService> {
  service: SurveyTemplateService;
  status: boolean = true;
  questionSet: ITemplateQuestionSection[] = [];

  sections: SurveySection[] = [];

  constructor() {
    super();
    this.service = FactoryService.getService('SurveyTemplateService');
  }

  buildForm(controls: boolean = false) {
    const { arName, enName, status } = this;
    return {
      arName: controls ? [arName, [CustomValidators.required]] : arName,
      enName: controls ? [enName, [CustomValidators.required]] : enName,
      status: controls ? [status, [CustomValidators.required]] : status,
    };
  }
}
