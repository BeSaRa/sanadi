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

  getQuestionsIds(): number[] {
    return this.sectionSet.reduce((list, current) => {
      list = list.concat(current.questionSet.map(i => i.question.id) as number[]);
      return list;
    }, [] as number[])
  }

  sortBasedOnIndex(): SurveyTemplate {
    this.sectionSet = this.sectionSet.map((item, index) => {
      item.sectionOrder = index;
      item.questionSet = item.questionSet.map((q, index) => {
        q.questionOrder = index;
        return q;
      })
      return item;
    });
    return this;
  }

  sortSectionsAndQuestions(): SurveyTemplate {
    this.sectionSet = this.sectionSet.map((item) => {
      item.questionSet = item.questionSet.sort((a, b) => a.questionOrder! - b.questionOrder!)
      return item;
    }).sort((a, b) => a.sectionOrder - b.sectionOrder);
    return this;
  }
}
