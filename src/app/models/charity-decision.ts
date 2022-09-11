import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { CharityDecisionInterceptor } from '@app/model-interceptors/charity-Decision-interceptor';
import { CharityDecisionService } from '@app/services/charity-decision.service';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDateModel } from 'angular-mydatepicker';
import { BaseModel } from './base-model';

const interceptor = new CharityDecisionInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send,
})
export class CharityDecision extends BaseModel<
  CharityDecision,
  CharityDecisionService
> {
  service: CharityDecisionService = FactoryService.getService(
    'CharityDecisionService'
  );
  langService: LangService = FactoryService.getService('LangService');
  referenceNumber!: string;
  generalDate!: string | IMyDateModel;
  decisionType!: number;
  subject!: string;
  organization!: string;

  buildForm(controls = true) {
    const {
      referenceNumber,
      generalDate,
      decisionType,
      subject,
      organization,
    } = this;

    return {
      referenceNumber: controls
        ? [referenceNumber, [CustomValidators.required]]
        : referenceNumber,
      generalDate: controls
        ? [generalDate, [CustomValidators.required]]
        : generalDate,
      decisionType: controls
        ? [decisionType, [CustomValidators.required]]
        : decisionType,
      subject: controls ? [subject, [CustomValidators.required]] : subject,
      organization: controls
        ? [organization, [CustomValidators.required]]
        : organization,
    };
  }
}
