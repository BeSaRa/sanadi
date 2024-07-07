import { ControlValueLabelLangKey } from './../types/types';
import { CaseModel } from '@app/models/case-model';
import { UrgentJointReliefCampaignService } from '@services/urgent-joint-relief-campaign.service';
import { CaseTypes } from '@app/enums/case-types.enum';
import { UrgentJointReliefCampaignInterceptor } from '@app/model-interceptors/urgent-joint-relief-campaign-interceptor';
import { InterceptModel } from '@decorators/intercept-model';
import { AdminResult } from '@app/models/admin-result';
import { FactoryService } from '@services/factory.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { ParticipantOrganization } from '@app/models/participant-organization';
import { EmployeeService } from '@services/employee.service';
import { OrganizationOfficer } from '@app/models/organization-officer';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { UntypedFormGroup } from '@angular/forms';
import { ISearchFieldsMap } from '@app/types/types';
import { dateSearchFields } from '@helpers/date-search-fields';
import { infoSearchFields } from '@helpers/info-search-fields';
import { normalSearchFields } from '@helpers/normal-search-fields';
import { CommonUtils } from '@app/helpers/common-utils';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { DateUtils } from '@app/helpers/date-utils';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { TaskAdminResult } from './task-admin-result';

const interceptor = new UrgentJointReliefCampaignInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})

export class UrgentJointReliefCampaign extends CaseModel<UrgentJointReliefCampaignService, UrgentJointReliefCampaign> implements IAuditModelProperties<UrgentJointReliefCampaign> {
  service!: UrgentJointReliefCampaignService;
  caseType = CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN;

  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  serviceSteps!: string;
  organizationId!: number;
  licenseApprovedDate!: string;
  requestType!: number;
  subject!: string;
  fullName!: string;
  phone!: string;
  extraPhone!: string;
  creatorDomainName!: string;
  licenseStartDate!: string | IMyDateModel;
  licenseEndDate!: string | IMyDateModel;
  description!: string;
  totalCost!: number;
  followUpDate!: string;
  exportedLicenseFullSerial!: string;
  exportedLicenseId!: string;
  exportedLicenseSerial!: number;
  conditionalLicenseIndicator!: boolean;
  targetAmount!: number;
  beneficiaryCountry!: number;
  approvalPeriod!: number;
  customTerms!: string;
  publicTerms!: string;
  organizaionOfficerList: OrganizationOfficer[] = [];
  requestTypeInfo!: AdminResult;
  beneficiaryCountryInfo!: AdminResult;
  participatingOrganizaionList: ParticipantOrganization[] = [];
  donation!: number;
  workStartDate!: string | IMyDateModel;
  employeeService!: EmployeeService;
  locations: TaskAdminResult[] = [];

  searchFields: ISearchFieldsMap<UrgentJointReliefCampaign> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['caseStatusInfo', 'requestTypeInfo', 'ouInfo', 'creatorInfo']),
    ...normalSearchFields(['fullSerial', 'subject'])
  };

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  constructor() {
    super();
    this.service = FactoryService.getService('UrgentJointReliefCampaignService');
    this.employeeService = FactoryService.getService('EmployeeService');
  }

  getMainInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      totalCost: { langKey: 'joint_relief_campaign_total_donations', value: this.totalCost },
    }
  }
  buildMainInfo(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<UrgentJointReliefCampaign>(this.getMainInfoValuesWithLabels())

    return controls ? [values.totalCost] : values.totalCost
  }

  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      fullName: { langKey: 'campaign_name', value: this.fullName },
      licenseStartDate: { langKey: 'campaign_start_date', value: this.licenseStartDate },
      licenseEndDate: { langKey: 'campaign_end_date', value: this.licenseEndDate },
      phone: { langKey: 'lbl_phone', value: this.phone },
      extraPhone: { langKey: 'lbl_extra_phone_number', value: this.extraPhone },
      approvalPeriod: { langKey: 'approval_period', value: this.approvalPeriod },
      beneficiaryCountry: { langKey: 'beneficiary_country', value: this.beneficiaryCountry },
      targetAmount: { langKey: 'target_amount', value: this.targetAmount },
    };
  }
  buildBasicInfo(controls: boolean = false): any {
    const internalUserValidation = !this.employeeService.isExternalUser() ? [CustomValidators.required] : [];
    const values = ObjectUtils.getControlValues<UrgentJointReliefCampaign>(this.getBasicInfoValuesWithLabels())
    return {
      fullName: controls ? [values.fullName, internalUserValidation.concat([CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)])] : values.fullName,
      licenseStartDate: controls ? [values.licenseStartDate, internalUserValidation] : values.licenseStartDate,
      licenseEndDate: controls ? [values.licenseEndDate, internalUserValidation] : values.licenseEndDate,
      phone: controls ? [values.phone, internalUserValidation.concat(CustomValidators.commonValidations.phone)] : values.phone,
      extraPhone: controls ? [values.extraPhone, CustomValidators.commonValidations.phone] : values.extraPhone,
      approvalPeriod: controls ? [values.approvalPeriod, internalUserValidation.concat(CustomValidators.number, CustomValidators.maxLength(2))] : values.approvalPeriod,
      beneficiaryCountry: controls ? [values.beneficiaryCountry, internalUserValidation] : values.beneficiaryCountry,
      targetAmount: controls ? [values.targetAmount, internalUserValidation.concat([CustomValidators.number, CustomValidators.maxLength(20)])] : values.targetAmount
    }
  }

  getExplanationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      description: { langKey: 'special_explanations', value: this.description },
    }
  }
  buildExplanation(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<UrgentJointReliefCampaign>(this.getExplanationValuesWithLabels())
    return {
      description: controls ? [values.description, CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)] : values.description,
    }
  }

  getExternalUserDataValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      donation: { langKey: 'joint_relief_campaign_total_donations', value: this.donation },
      workStartDate: { langKey: 'work_start_date', value: this.workStartDate },
    };
  }
  buildExternalUserData(controls: boolean = false): any {
    const externalUserValidation = this.employeeService.isExternalUser() ? [CustomValidators.required] : [];
    const values = ObjectUtils.getControlValues<UrgentJointReliefCampaign>(this.getExternalUserDataValuesWithLabels())

    return {
      donation: controls ? [values.donation, externalUserValidation.concat([CustomValidators.number, CustomValidators.maxLength(20)])] : values.donation,
      workStartDate: controls ? [values.workStartDate, externalUserValidation] : values.workStartDate
    }
  }

  getAdminResultByProperty(property: keyof UrgentJointReliefCampaign): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'beneficiaryCountry':
        adminResultValue = this.beneficiaryCountryInfo;
        break;
      case 'licenseEndDate':
        const licenseEndDate = DateUtils.getDateStringFromDate(this.licenseEndDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: licenseEndDate, enName: licenseEndDate });
        break;
      case 'licenseStartDate':
        const licenseStartDate = DateUtils.getDateStringFromDate(this.licenseStartDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: licenseStartDate, enName: licenseStartDate });
        break;
      case 'workStartDate':
        const workStartDate = DateUtils.getDateStringFromDate(this.workStartDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: workStartDate, enName: workStartDate });
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
  getCaseStatus() {
    return this.caseStatus;
  }

  organizationApprove(externalUserData: { form: UntypedFormGroup, organizationOfficers: OrganizationOfficer[] }): DialogRef {
    return this.service.organizationApproveTask(this.taskDetails.tkiid, this.caseType, WFResponseType.ORGANIZATION_APPROVE, false, this, externalUserData);
  }

  validateApprove(): DialogRef {
    return this.service.validateApproveTask(this, WFResponseType.VALIDATE_APPROVE);
  }

  initialApprove(): DialogRef {
    return this.service.initialApproveTask(this, WFResponseType.INITIAL_APPROVE);
  }

  finalApprove(): DialogRef {
    return this.service.finalApproveTask(this, WFResponseType.FINAL_APPROVE);
  }

  buildFinalApprovalForm(controls: boolean = false): any {
    const {
      conditionalLicenseIndicator,
      publicTerms,
      customTerms,
    } = this;
    return {
      conditionalLicenseIndicator: controls ? [conditionalLicenseIndicator] : conditionalLicenseIndicator,
      publicTerms: controls ? [{ value: publicTerms, disabled: true }] : publicTerms,
      customTerms: controls ? [customTerms] : customTerms
    }
  }
}
