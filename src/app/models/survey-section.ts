import { BaseModel } from '@app/models/base-model';
import { SurveySectionService } from '@app/services/survey-section.service';
import { FactoryService } from '@app/services/factory.service';

export class SurveySection extends BaseModel<SurveySection, SurveySectionService> {
  service: SurveySectionService;

  constructor() {
    super();
    this.service = FactoryService.getService('SurveySectionService');
  }
}
