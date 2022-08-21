import { BaseModel } from '@app/models/base-model';
import { SurveySectionService } from '@app/services/survey-section.service';
import { FactoryService } from '@app/services/factory.service';
import { IQuestionSection } from "@app/interfaces/i-question-section";
import { CustomValidators } from "@app/validators/custom-validators";
import { INames } from "@app/interfaces/i-names";
import { LangService } from "@app/services/lang.service";
import { Observable, of } from "rxjs";
import { SurveySectionInterceptor } from "@app/model-interceptors/survey-section-interceptor";
import { InterceptModel } from "@decorators/intercept-model";

const { send, receive } = new SurveySectionInterceptor()

@InterceptModel({ send, receive })
export class SurveySection extends BaseModel<SurveySection, SurveySectionService> {
  service: SurveySectionService;
  questionSet: IQuestionSection[] = [];
  langService: LangService;
  sectionOrder: number = 0;

  constructor() {
    super();
    this.service = FactoryService.getService('SurveySectionService');
    this.langService = FactoryService.getService('LangService');
  }

  buildForm(controls: boolean) {
    const { arName, enName } = this;
    return {
      arName: controls ? [arName, [CustomValidators.required, CustomValidators.pattern('AR_NUM')]] : arName,
      enName: controls ? [enName, [CustomValidators.required, CustomValidators.pattern('ENG_NUM')]] : enName
    };
  }

  getName() {
    return this[(this.langService?.map.lang + 'Name') as keyof INames] || '';
  }

  save(): Observable<SurveySection> {
    return of(this);
  }
}
