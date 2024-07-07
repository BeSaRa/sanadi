import { AdminResult } from './admin-result';
import { WFResponseType } from './../enums/wfresponse-type.enum';
import { CustomValidators } from './../validators/custom-validators';
import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { AwarenessActivitySuggestionInterceptor } from '@model-interceptors/awareness-activity-suggestion-interceptor';
import { AwarenessActivitySuggestionService } from './../services/awareness-activity-suggestion.service';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { ControlValueLabelLangKey, ISearchFieldsMap } from './../types/types';
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
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { ObjectUtils } from '@app/helpers/object-utils';
import { CommonUtils } from '@app/helpers/common-utils';

const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const interceptor = new AwarenessActivitySuggestionInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class AwarenessActivitySuggestion
  extends _RequestType<AwarenessActivitySuggestionService, AwarenessActivitySuggestion>
  implements HasRequestType, HasLicenseDurationType, CaseModelContract<AwarenessActivitySuggestionService, AwarenessActivitySuggestion>, IAuditModelProperties<AwarenessActivitySuggestion> {
  service!: AwarenessActivitySuggestionService;
  caseType: number = CaseTypes.AWARENESS_ACTIVITY_SUGGESTION;
  requestType!: number;
  description!: string;
  activityType!: number;
  otherActivity!: string;

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

  activityTypeInfo!: AdminResult;

  beneficiaries!: string;
  beneficiariesNumber!: number;

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

  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getAdminResultByProperty(property: keyof AwarenessActivitySuggestion): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;
      case 'organizationId':
        adminResultValue = this.ouInfo;
        break;
      case 'activityType':
        adminResultValue = this.activityTypeInfo;
        break;

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  getBasicInfoFormValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: { langKey: 'request_type', value: this.requestType },
      subject: { langKey: 'subject', value: this.subject },
      goal: { langKey: 'goal', value: this.goal },
      activityType: { langKey: 'service_type', value: this.activityType },
      otherActivity: { langKey: 'lbl_other', value: this.otherActivity },
      oldLicenseFullSerial: { langKey: 'license_number', value: this.oldLicenseFullSerial },
    };
  }

  getContactOfficerValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      contactQID: { langKey: 'identification_number', value: this.contactQID },
      contactName: { langKey: 'full_name', value: this.contactName },
      contactEmail: { langKey: 'lbl_email', value: this.contactEmail },
      contactPhone: { langKey: 'lbl_phone', value: this.contactPhone },
      contactExtraPhone: { langKey: 'lbl_extra_phone_number', value: this.contactExtraPhone },
      jobTitle: { langKey: 'job_title', value: this.jobTitle },
    };
  }

  getBeneficiariesNatureValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      beneficiariesNumber: { langKey: 'lbl_beneficiaries_count', value: this.beneficiariesNumber },
      beneficiaries: { langKey: 'lbl_beneficiaries', value: this.beneficiaries },
    };
  }

  getSpecialExplanationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      description: { langKey: 'special_explanations', value: this.description },
    }
  }

  formBuilder(controls?: boolean) {
    const basicInfoValues = ObjectUtils.getControlValues<AwarenessActivitySuggestion>(this.getBasicInfoFormValuesWithLabels());
    const contactOfficerValues = ObjectUtils.getControlValues<AwarenessActivitySuggestion>(this.getContactOfficerValuesWithLabels());
    const beneficiariesNatureValues = ObjectUtils.getControlValues<AwarenessActivitySuggestion>(this.getBeneficiariesNatureValuesWithLabels());
    const specialExplanationValues = ObjectUtils.getControlValues<AwarenessActivitySuggestion>(this.getSpecialExplanationValuesWithLabels());

    return {
      description: controls ? [specialExplanationValues.description, Validators.required] : specialExplanationValues.description,
      basicInfo: {
        requestType: controls ? [basicInfoValues.requestType, Validators.required] : basicInfoValues.requestType,
        oldLicenseFullSerial: controls ? [basicInfoValues.oldLicenseFullSerial] : basicInfoValues.oldLicenseFullSerial,
        subject: controls ? [basicInfoValues.subject, [Validators.required]] : basicInfoValues.subject,
        activityType: controls ? [basicInfoValues.activityType, [Validators.required]] : basicInfoValues.activityType,
        otherActivity: controls ? [basicInfoValues.otherActivity, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : basicInfoValues.otherActivity,
        goal: controls ? [basicInfoValues.goal, [Validators.required]] : basicInfoValues.goal,
      },
      contactOfficer: {
        contactQID: controls ? [contactOfficerValues.contactQID, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)] : contactOfficerValues.contactQID,
        contactName: controls ? [contactOfficerValues.contactName, [CustomValidators.required, Validators.maxLength(300)]] : contactOfficerValues.contactName,
        contactEmail: controls ? [contactOfficerValues.contactEmail, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(100)]] : contactOfficerValues.contactEmail,
        contactPhone: controls ? [contactOfficerValues.contactPhone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : contactOfficerValues.contactPhone,
        contactExtraPhone: controls ? [contactOfficerValues.contactExtraPhone, CustomValidators.commonValidations.phone] : contactOfficerValues.contactExtraPhone,
        jobTitle: controls ? [contactOfficerValues.jobTitle, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : contactOfficerValues.jobTitle,
      },
      beneficiariesNature: {
        beneficiaries: controls ? [beneficiariesNatureValues.beneficiaries, [CustomValidators.maxLength(CustomValidators.defaultLengths.NUMBERS_MAXLENGTH)]] : beneficiariesNatureValues.beneficiaries,
        beneficiariesNumber: controls ? [beneficiariesNatureValues.beneficiariesNumber, [CustomValidators.required]] : beneficiariesNatureValues.beneficiariesNumber,
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

  approve(): DialogRef {
    return this.service.approve(this, WFResponseType.APPROVE)
  }

  finalApprove(): DialogRef {
    return this.service.finalApprove(this, WFResponseType.FINAL_APPROVE)
  }
}
