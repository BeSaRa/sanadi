import { AdminResult } from './admin-result';
import { WFResponseType } from './../enums/wfresponse-type.enum';
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
import { UntypedFormGroup, Validators } from "@angular/forms";
import { FactoryService } from "@services/factory.service";
import { InterceptModel } from "@decorators/intercept-model";
import { CaseModel } from "@app/models/case-model";
import { HasRequestType } from "@app/interfaces/has-request-type";
import { mixinRequestType } from "@app/mixins/mixin-request-type";
import { CaseModelContract } from "@contracts/case-model-contract";
import { DialogRef } from '@app/shared/models/dialog-ref';

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
  description!: string;

  followUpDate!: string | IMyDateModel;

  identificationNumber!: string;
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

  agreementWithRACA!: boolean | number;
  subject!: string;
  expectedDate!: string | IMyDateModel;
  goal!: string;
  activityName!: string;

  oldLicenseFullSerial!: string;
  oldLicenseId!: string;
  oldLicenseSerial!: number;
  ouInfo!: AdminResult;
  licenseStatusInfo!: AdminResult;
  profileType!: number;

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
      goal,
      activityName,

      oldLicenseFullSerial
    } = this;
    return {
      requestType: controls ? [requestType, Validators.required] : requestType,
      oldLicenseFullSerial: controls ? [oldLicenseFullSerial] : oldLicenseFullSerial,
      description: controls ? [description, Validators.required] : description,
      dataOfApplicant: {
        identificationNumber: controls ? [identificationNumber, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)] : identificationNumber,
        enName: controls ? [enName, [CustomValidators.required, Validators.maxLength(300)]] : enName,
        jobTitle: controls ? [jobTitle, [Validators.required, CustomValidators.maxLength(100)]] : jobTitle,
        address: controls ? [address, [Validators.required, CustomValidators.maxLength(100)]] : address,
        email: controls ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(100)]] : email,
        phone: controls ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
        mobileNo: controls ? [mobileNo, CustomValidators.commonValidations.phone] : mobileNo,
      },
      contactOfficer: {
        contactQID: controls ? [contactQID, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)] : contactQID,
        contactName: controls ? [contactName, [CustomValidators.required, Validators.maxLength(300)]] : contactName,
        contactEmail: controls ? [contactEmail, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(100)]] : contactEmail,
        contactPhone: controls ? [contactPhone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : contactPhone,
        contactExtraPhone: controls ? [contactExtraPhone, CustomValidators.commonValidations.phone] : contactExtraPhone,
      },
      activity: {
        activityName: controls ? [activityName, [Validators.required, Validators.maxLength(300)]] : activityName,
        agreementWithRACA: controls ? [agreementWithRACA, Validators.required] : agreementWithRACA,
        subject: controls ? [subject, [Validators.required]] : subject,
        expectedDate: controls ? [expectedDate, [Validators.required]] : expectedDate,
        goal: controls ? [goal, [Validators.required]] : goal
      },
    };
  }

  buildApprovalForm(control: boolean = false): any {
    const {
      followUpDate
    } = this;
    return {
      followUpDate: control ? [followUpDate, [CustomValidators.required]] : followUpDate
    }
  }
  approveWithSave(form: UntypedFormGroup): DialogRef {
    this.expectedDate = form.value.activity.expectedDate;
    return this.service.approve(this, WFResponseType.APPROVE)
  }
  finalApprove(): DialogRef {
    return this.service.finalApprove(this, WFResponseType.FINAL_APPROVE)
  }
}
