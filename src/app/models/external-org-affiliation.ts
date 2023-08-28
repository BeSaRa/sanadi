import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { ControlValueLabelLangKey, ISearchFieldsMap } from './../types/types';
import { IMyDateModel } from 'angular-mydatepicker';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { Validators } from '@angular/forms';
import { CustomValidators } from '@app/validators/custom-validators';
import { ExecutiveManagement } from '@app/models/executive-management';
import { ContactOfficer } from '@app/models/contact-officer';
import { BankAccount } from '@app/models/bank-account';
import { FactoryService } from '@services/factory.service';
import { ExternalOrgAffiliationInterceptor } from './../model-interceptors/external-org-affiliation-interceptor';
import { CaseTypes } from './../enums/case-types.enum';
import { ExternalOrgAffiliationService } from '@services/external-org-affiliation.service';
import { HasRequestType } from '@contracts/has-request-type';
import { mixinLicenseDurationType } from '@app/mixins/mixin-license-duration';
import { CaseModel } from '@app/models/case-model';
import { mixinRequestType } from '@app/mixins/mixin-request-type';
import { InterceptModel } from '@decorators/intercept-model';
import { AdminResult } from './admin-result';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { ObjectUtils } from '@app/helpers/object-utils';
import { CommonUtils } from '@app/helpers/common-utils';

const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const { send, receive } = new ExternalOrgAffiliationInterceptor();

@InterceptModel({ send, receive })
export class ExternalOrgAffiliation extends _RequestType<ExternalOrgAffiliationService, ExternalOrgAffiliation> implements HasRequestType,IAuditModelProperties<ExternalOrgAffiliation> {
  service: ExternalOrgAffiliationService;
  caseType: number = CaseTypes.EXTERNAL_ORG_AFFILIATION_REQUEST;

  requestType!: number;
  category!: number;
  arName!: string;
  enName!: string
  country!: number;
  subject!: string;
  city!: string;
  phone!: string;
  fax!: string;
  website!: string;
  email!: string;
  mailBox!: string;
  description!: string;
  introduction!: string;
  bankAccountDTOs: BankAccount[] = [];
  executiveManagementDTOs: ExecutiveManagement[] = [];
  contactOfficerDTOs: ContactOfficer[] = [];
  countryInfo!: AdminResult;
  customTerms!: string;
  publicTerms!: string;
  conditionalLicenseIndicator!: boolean;
  followUpDate!: string | IMyDateModel;
  oldLicenseFullSerial!: string;
  oldLicenseId!: string;
  oldLicenseSerial!: number;
  constructor() {
    super();
    this.service = FactoryService.getService('ExternalOrgAffiliationService');
    this.finalizeSearchFields();
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }
  searchFields: ISearchFieldsMap<ExternalOrgAffiliation> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['caseStatusInfo', 'requestTypeInfo', 'creatorInfo']),
    ...normalSearchFields(['fullSerial', 'subject'])
  };
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: {langKey: 'request_type', value: this.requestType},
      category:{langKey: 'main_category', value: this.category},
      oldLicenseFullSerial:{langKey: 'license_number', value: this.oldLicenseFullSerial},
      arName:{langKey: 'arabic_name', value: this.arName},
      enName:{langKey: 'english_name', value: this.enName},
      country:{langKey: 'country', value: this.country},
      city:{langKey: 'city', value: this.city},
      phone:{langKey: 'lbl_phone', value: this.phone},
      fax:{langKey: 'fax_number', value: this.fax},
      website:{langKey: 'website', value: this.website},
      email:{langKey: 'lbl_email', value: this.email},
      mailBox:{langKey: 'lbl_po_box_num', value: this.mailBox},
      introduction:{langKey: 'lbl_introduction', value: this.introduction}
    };
  }

  getExplanationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      description: {langKey: 'special_explanations', value: this.description},

    };
  }
  getFormFields(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<ExternalOrgAffiliation>(this.getBasicInfoValuesWithLabels());
    return {
      oldLicenseFullSerial: control ? [values.oldLicenseFullSerial] : values.oldLicenseFullSerial,
      requestType: control ? [values.requestType, [CustomValidators.required]] : values.requestType,
      country: control ? [values.country, [CustomValidators.required]] : values.country,
      category: control ? [values.category, [CustomValidators.required]] : values.category,
      arName: control ? [values.arName, [CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
      Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')]] : values.arName,
      enName: control ? [values.enName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]] : values.enName,
      city: control ? [values.city, [CustomValidators.required, CustomValidators.maxLength(100)]] : values.city,
      website: control ? [values.website, [
        CustomValidators.required,
        CustomValidators.pattern('WEBSITE')
      ]] : values.website,
      phone: control ? [values.phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : values.phone,
      fax: control ? [values.fax, [CustomValidators.required].concat(CustomValidators.commonValidations.fax)] : values.fax,
      mailBox: control ? [values.mailBox, [CustomValidators.required, CustomValidators.number, Validators.maxLength(10)]] : values.mailBox,
      email: control ? [values.email, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(100)]] : values.email,
      introduction: control ? [values.introduction, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.introduction,
    }
  }
  buildExplanation(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<ExternalOrgAffiliation>(this.getExplanationValuesWithLabels());
    return {
      description: control ? [values.description, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.description
    }
  }
  buildApprovalForm(control: boolean = false): any {
    const {
      customTerms,
      publicTerms,
      conditionalLicenseIndicator,
      followUpDate
    } = this;
    return {
      customTerms: control ? [customTerms, [CustomValidators.required]] : customTerms,
      publicTerms: control ? [publicTerms, [CustomValidators.required]] : publicTerms,
      conditionalLicenseIndicator: control ? [conditionalLicenseIndicator] : conditionalLicenseIndicator,
      followUpDate: control ? [followUpDate, [CustomValidators.required]] : followUpDate
    }
  }
  approve(): DialogRef {
    return this.service.approve(this, WFResponseType.APPROVE)
  }
  finalApprove(): DialogRef {
    return this.service.approve(this, WFResponseType.FINAL_APPROVE)
  }
  getAdminResultByProperty(property: keyof ExternalOrgAffiliation): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;
      case 'country':
        adminResultValue = this.countryInfo;
        break;

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }
}
