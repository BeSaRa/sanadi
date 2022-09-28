import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { DateUtils } from '@app/helpers/date-utils';
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
  id!: number;
  objectDBId?: number;
  category?: number;
  buildForm(controls = true) {
    const { referenceNumber, generalDate, category, subject, organization } =
      this;

    return {
      referenceNumber: controls
        ? [
          referenceNumber,
          [
            CustomValidators.required,
            CustomValidators.maxLength(CustomValidators.defaultLengths._500),
          ],
        ]
        : referenceNumber,
      generalDate: controls
        ? [generalDate, [CustomValidators.required]]
        : generalDate,
      subject: controls
        ? [
          subject,
          [
            CustomValidators.required,
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ADDRESS_MAX
            ),
          ],
        ]
        : subject,
      organization: controls
        ? [organization, [CustomValidators.required]]
        : organization,
      category: controls ? [category, [CustomValidators.required]] : category,
    };
  }
  toCharityOrganizationUpdate() {
    const {
      id,
      referenceNumber,
      subject,
      decisionType,
      generalDate,
      category,
      organization,
    } = this;
    return new CharityDecision().clone({
      objectDBId: id,
      referenceNumber,
      subject,
      generalDate: DateUtils.getDateStringFromDate(generalDate),
      category,

      decisionType,
      organization,
    });
  }
}
