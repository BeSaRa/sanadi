import { AdminResult } from './admin-result';
import { WFResponseType } from './../enums/wfresponse-type.enum';
import { CustomValidators } from './../validators/custom-validators';
import { IMyDateModel } from 'angular-mydatepicker';
import { AwarenessActivitySuggestionInterceptor } from './../model-interceptors/awareness-activity-suggestion';
import { AwarenessActivitySuggestionService } from './../services/awareness-activity-suggestion.service';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { ISearchFieldsMap, ControlValueLabelLangKey } from './../types/types';
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
  implements HasRequestType, HasLicenseDurationType, CaseModelContract<AwarenessActivitySuggestionService, AwarenessActivitySuggestion>,IAuditModelProperties<AwarenessActivitySuggestion> {
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

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }
  getFormValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: {langKey: 'request_type', value: this.requestType},
      description:{langKey: 'special_explanations', value: this.description},
      agreementWithRACA:{langKey: 'does_organization_have_agreement_with_RACA', value: this.agreementWithRACA},
      subject:{langKey: 'subject', value: this.subject},
      expectedDate:{langKey: 'expected_date', value: this.expectedDate},
      goal:{langKey: 'goal', value: this.goal},
      activityName:{langKey: 'activity_name', value: this.activityName},
      oldLicenseFullSerial:{langKey: 'license_number', value: this.oldLicenseFullSerial},
    };
  }
  getContactOfficerValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      contactQID:{langKey: 'identification_number', value: this.contactQID},
      contactName:{langKey: 'full_name', value: this.contactName},
      contactEmail:{langKey: 'lbl_email', value: this.contactEmail},
      contactPhone:{langKey: 'lbl_phone', value: this.contactPhone},
      contactExtraPhone:{langKey: 'lbl_extra_phone_number', value: this.contactExtraPhone},

    };
  }
  getDataOfApplicantValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      identificationNumber:{langKey: 'identification_number', value: this.identificationNumber},
      enName:{langKey: 'name', value: this.enName},
      jobTitle:{langKey: 'lbl_job_title', value: this.jobTitle},
      address:{langKey: 'lbl_address', value: this.address},
      email:{langKey: 'lbl_email', value: this.email},
      phone:{langKey: 'lbl_phone', value: this.phone},
      mobileNo:{langKey: 'lbl_extra_phone_number', value: this.mobileNo},

    };
  }
  formBuilder(controls?: boolean) {
    const values = ObjectUtils.getControlValues<AwarenessActivitySuggestion>(this.getFormValuesWithLabels());
    const contactOfficer = ObjectUtils.getControlValues<AwarenessActivitySuggestion>(this.getContactOfficerValuesWithLabels());
    const dataOfApplicant = ObjectUtils.getControlValues<AwarenessActivitySuggestion>(this.getDataOfApplicantValuesWithLabels());
    return {
      requestType: controls ? [values.requestType, Validators.required] : values.requestType,
      oldLicenseFullSerial: controls ? [values.oldLicenseFullSerial] : values.oldLicenseFullSerial,
      description: controls ? [values.description, Validators.required] : values.description,
      dataOfApplicant: {
        identificationNumber: controls ? [dataOfApplicant.identificationNumber, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)] : dataOfApplicant.identificationNumber,
        enName: controls ? [dataOfApplicant.enName, [CustomValidators.required, Validators.maxLength(300)]] : dataOfApplicant.enName,
        jobTitle: controls ? [dataOfApplicant.jobTitle, [Validators.required, CustomValidators.maxLength(100)]] : dataOfApplicant.jobTitle,
        address: controls ? [dataOfApplicant.address, [Validators.required, CustomValidators.maxLength(100)]] : dataOfApplicant.address,
        email: controls ? [dataOfApplicant.email, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(100)]] : dataOfApplicant.email,
        phone: controls ? [dataOfApplicant.phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : dataOfApplicant.phone,
        mobileNo: controls ? [dataOfApplicant.mobileNo, CustomValidators.commonValidations.phone] : dataOfApplicant.mobileNo,
      },
      contactOfficer: {
        contactQID: controls ? [contactOfficer.contactQID, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)] : contactOfficer.contactQID,
        contactName: controls ? [contactOfficer.contactName, [CustomValidators.required, Validators.maxLength(300)]] : contactOfficer.contactName,
        contactEmail: controls ? [contactOfficer.contactEmail, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(100)]] : contactOfficer.contactEmail,
        contactPhone: controls ? [contactOfficer.contactPhone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : contactOfficer.contactPhone,
        contactExtraPhone: controls ? [contactOfficer.contactExtraPhone, CustomValidators.commonValidations.phone] : contactOfficer.contactExtraPhone,
      },
      activity: {
        activityName: controls ? [values.activityName, [Validators.required, Validators.maxLength(300)]] : values.activityName,
        agreementWithRACA: controls ? [values.agreementWithRACA, Validators.required] : values.agreementWithRACA,
        subject: controls ? [values.subject, [Validators.required]] : values.subject,
        expectedDate: controls ? [values.expectedDate, [Validators.required]] : values.expectedDate,
        goal: controls ? [values.goal, [Validators.required]] : values.goal
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
