import {BaseModel} from '@app/models/base-model';
import {SurveyTemplateService} from '@app/services/survey-template.service';
import {FactoryService} from '@app/services/factory.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {SurveySection} from '@app/models/survey-section';
import {LangService} from "@app/services/lang.service";
import {INames} from "@app/interfaces/i-names";

export class SurveyTemplate extends BaseModel<SurveyTemplate, SurveyTemplateService> {
  service: SurveyTemplateService;
  status: boolean = true;
  sectionSet: SurveySection[] = [];

  langService: LangService;

  constructor() {
    super();
    this.service = FactoryService.getService('SurveyTemplateService');

    this.langService = FactoryService.getService('LangService');
  }

  buildForm(controls: boolean = false) {
    const {arName, enName, status} = this;
    return {
      arName: controls ? [arName, [CustomValidators.required]] : arName,
      enName: controls ? [enName, [CustomValidators.required]] : enName,
      status: controls ? [status, [CustomValidators.required]] : status,
    };
  }

  getName() {
    return this[(this.langService?.map.lang + 'Name') as keyof INames] || '';
  }
}
