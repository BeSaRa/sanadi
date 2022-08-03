import { BaseModel } from "@app/models/base-model";
import { SurveyQuestionService } from "@app/services/survey-question.service";
import { FactoryService } from "@app/services/factory.service";
import { CustomValidators } from "@app/validators/custom-validators";
import { LangService } from "@app/services/lang.service";
import { INames } from "@app/interfaces/i-names";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { SurveyQuestionInterceptor } from "@app/model-interceptors/survey-question-interceptor";
import { InterceptModel } from "@decorators/intercept-model";

const interceptor = new SurveyQuestionInterceptor()

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class SurveyQuestion extends BaseModel<SurveyQuestion, SurveyQuestionService> {
  service: SurveyQuestionService;
  langService: LangService;
  isFreeText: boolean = false;

  constructor() {
    super();
    this.service = FactoryService.getService('SurveyQuestionService');
    this.langService = FactoryService.getService('LangService');
  }

  buildForm(controls: boolean) {
    const { arName, enName, isFreeText } = this;
    return {
      arName: controls ? [arName, CustomValidators.required] : arName,
      enName: controls ? [enName, CustomValidators.required] : enName,
      isFreeText: controls ? [isFreeText, CustomValidators.required] : isFreeText
    };
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  getIsFreeTextValue(): string {
    return this.langService.map[(this.isFreeText ? 'lbl_yes' : 'lbl_no') as keyof ILanguageKeys];
  }
}
