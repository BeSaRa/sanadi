import { CustomValidators } from './../validators/custom-validators';
import { IMyDateModel } from 'angular-mydatepicker';
import { AwarenessActivitySuggestionInterceptor } from './../model-interceptors/awareness-activity-suggestion';
import { AwarenessActivitySuggestionService } from './../services/awareness-activity-suggestion.service';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { ISearchFieldsMap } from './../types/types';
import { HasLicenseDurationType } from '@contracts/has-license-duration-type';
import { CaseTypes } from '@app/enums/case-types.enum';
import { mixinLicenseDurationType } from "@app/mixins/mixin-license-duration";
import { Validators } from "@angular/forms";
import { FactoryService } from "@services/factory.service";
import { InterceptModel } from "@decorators/intercept-model";
import { CaseModel } from "@app/models/case-model";
import { HasRequestType } from "@app/interfaces/has-request-type";
import { mixinRequestType } from "@app/mixins/mixin-request-type";
import { CaseModelContract } from "@contracts/case-model-contract";

const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const interceptor = new AwarenessActivitySuggestionInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class AwarenessActivitySuggestion
  extends _RequestType<AwarenessActivitySuggestionService, AwarenessActivitySuggestion>
  implements HasRequestType, HasLicenseDurationType, CaseModelContract<AwarenessActivitySuggestionService, AwarenessActivitySuggestion> {
  service!: AwarenessActivitySuggestionService;
  caseType: number = CaseTypes.AWARENESS_ACTIVITY_SUGGESTION;
  requestType!: number;
  licenseApprovedDate!: string | IMyDateModel;
  oldLicenseFullSerial!: string;
  description!: string;

  identificationNumber!: string;
  arName!: string;
  enName!: string;
  jobTitle!: string;
  address!: string;
  email!: string;
  phone!: string;
  mobileNo!: string;

  contactQID!: string;
  contactName!: string;
  contactEmail!: string;
  contactPhone!: string;
  contactExtraPhone!: string;

  agreementWithRACA: boolean = false;
  subject!: string;
  expectedDate!: string | IMyDateModel;
  goal!: string;

  searchFields: ISearchFieldsMap<AwarenessActivitySuggestion> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['caseStatusInfo', 'creatorInfo', 'ouInfo']),
    ...normalSearchFields(['fullSerial', 'subject'])
  };
  constructor() {
    super();
    this.service = FactoryService.getService("AwarenessActivitySuggestionService");
    this.finalizeSearchFields();
  }
  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  formBuilder(controls?: boolean) {
    const {
      requestType, description,

      identificationNumber,
      arName,
      enName,
      jobTitle,
      address,
      email,
      phone,
      mobileNo,

      contactQID,
      contactName,
      contactEmail,
      contactPhone,
      contactExtraPhone,

      agreementWithRACA,
      subject,
      expectedDate,
      goal
    } = this;
    return {
      requestType: controls ? [requestType, Validators.required] : requestType,
      description: controls ? [description, Validators.required] : description,
      dataOfApplicant: {
        identificationNumber: controls ? [identificationNumber, CustomValidators.maxLength(20)] : identificationNumber,
        arName: controls ? [arName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')]] : arName,
        enName: controls ? [enName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]] : enName,
        jobTitle: controls ? [jobTitle, [Validators.required, CustomValidators.maxLength(100)]] : jobTitle,
        address: controls ? [address, [Validators.required, CustomValidators.maxLength(100)]] : address,
        email: controls ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(100)]] : email,
        phone: controls ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
        mobileNo: controls ? [mobileNo, CustomValidators.commonValidations.phone] : mobileNo,
      },
      contactOfficer: {
        contactQID: controls ? [contactQID, CustomValidators.maxLength(20)] : contactQID,
        contactName: controls ? [contactName, [
          CustomValidators.required, Validators.maxLength(300), Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : contactName,
        contactEmail: controls ? [contactEmail, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(100)]] : contactEmail,
        contactPhone: controls ? [contactPhone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : contactPhone,
        contactExtraPhone: controls ? [contactExtraPhone, CustomValidators.commonValidations.phone] : contactExtraPhone,
      },
      activity: {
        agreementWithRACA: controls ? [agreementWithRACA] : agreementWithRACA,
        subject: controls ? [subject, [Validators.required, CustomValidators.maxLength(100)]] : subject,
        expectedDate: controls ? [expectedDate, [Validators.required]] : expectedDate,
        goal: controls ? [goal, [Validators.required]] : goal,
      },
    };
  }
}
