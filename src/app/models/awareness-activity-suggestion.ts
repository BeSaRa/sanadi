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

  contactQID!: string;
  contactName!: string;
  contactEmail!: string;
  contactPhone!: string;
  contactExtraPhone!: string;
  jobTitle!: string;

  subject!: string;
  goal!: string;

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

      contactQID,
      contactName,
      contactEmail,
      contactPhone,
      contactExtraPhone,
      jobTitle,

      subject,
      goal,

      oldLicenseFullSerial
    } = this;
    return {
      description: controls ? [description, Validators.required] : description,
      basicInfo: {
        requestType: controls ? [requestType, Validators.required] : requestType,
        oldLicenseFullSerial: controls ? [oldLicenseFullSerial] : oldLicenseFullSerial,
        subject: controls ? [subject, [Validators.required]] : subject,
        goal: controls ? [goal, [Validators.required]] : goal,
      },
      contactOfficer: {
        contactQID: controls ? [contactQID, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)] : contactQID,
        contactName: controls ? [contactName, [CustomValidators.required, Validators.maxLength(300)]] : contactName,
        contactEmail: controls ? [contactEmail, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(100)]] : contactEmail,
        contactPhone: controls ? [contactPhone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : contactPhone,
        contactExtraPhone: controls ? [contactExtraPhone, CustomValidators.commonValidations.phone] : contactExtraPhone,
        jobTitle: controls ? [jobTitle, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : jobTitle,
      },
      beneficiariesNature: {

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
    return this.service.approve(this, WFResponseType.APPROVE)
  }
  finalApprove(): DialogRef {
    return this.service.finalApprove(this, WFResponseType.FINAL_APPROVE)
  }
}
