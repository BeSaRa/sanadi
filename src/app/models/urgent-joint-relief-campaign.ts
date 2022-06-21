import {CaseModel} from '@app/models/case-model';
import {UrgentJointReliefCampaignService} from '@services/urgent-joint-relief-campaign.service';
import {CaseTypes} from '@app/enums/case-types.enum';
import {UrgentJointReliefCampaignInterceptor} from '@app/model-interceptors/urgent-joint-relief-campaign-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {AdminResult} from '@app/models/admin-result';
import {FactoryService} from '@services/factory.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {IMyDateModel} from 'angular-mydatepicker';
import {ParticipantOrganization} from '@app/models/participant-organization';
import {EmployeeService} from '@services/employee.service';
import {OrganizationOfficer} from '@app/models/organization-officer';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {FormGroup} from '@angular/forms';

const interceptor = new UrgentJointReliefCampaignInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})

export class UrgentJointReliefCampaign extends CaseModel<UrgentJointReliefCampaignService, UrgentJointReliefCampaign> {
  service!: UrgentJointReliefCampaignService;
  caseType = CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN;

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
  participatingOrganizaionList: Partial<ParticipantOrganization>[] = [];
  donation!: number;
  workStartDate!: string | IMyDateModel;
  employeeService!: EmployeeService;

  constructor() {
    super();
    this.service = FactoryService.getService('UrgentJointReliefCampaignService');
    this.employeeService = FactoryService.getService('EmployeeService');
  }

  buildMainInfo(controls: boolean = false): any {
    const {totalCost} = this;
    return controls ? [totalCost] : totalCost
  }

  buildBasicInfo(controls: boolean = false): any {
    const internalUserValidation = !this.employeeService.isExternalUser() ? [CustomValidators.required] : [];
    const {fullName, licenseStartDate, licenseEndDate, phone, extraPhone, approvalPeriod, beneficiaryCountry, targetAmount} = this;
    return {
      fullName: controls ? [fullName, internalUserValidation.concat([CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)])] : fullName,
      licenseStartDate: controls ? [licenseStartDate, internalUserValidation.concat([CustomValidators.required])] : licenseStartDate,
      licenseEndDate: controls ? [licenseEndDate, internalUserValidation] : licenseEndDate,
      phone: controls ? [phone, internalUserValidation.concat(CustomValidators.commonValidations.phone)] : phone,
      extraPhone: controls ? [extraPhone, CustomValidators.commonValidations.phone] : extraPhone,
      approvalPeriod: controls ? [approvalPeriod, internalUserValidation] : approvalPeriod,
      beneficiaryCountry: controls ? [beneficiaryCountry, internalUserValidation] : beneficiaryCountry,
      targetAmount: controls ? [targetAmount, internalUserValidation] : targetAmount
    }
  }

  buildExplanation(controls: boolean = false): any {
    const {description} = this;
    return {
      description: controls ? [description] : description,
    }
  }

  buildExternalUserData(controls: boolean = false): any {
    const externalUserValidation = this.employeeService.isExternalUser() ? [CustomValidators.required] : [];
    const {donation, workStartDate} = this;
    return {
      donation: controls ? [donation, externalUserValidation] : donation,
      workStartDate: controls ? [workStartDate, externalUserValidation] : workStartDate
    }
  }

  getCaseStatus() {
    return this.caseStatus;
  }

  organizationApprove(externalUserData: {form: FormGroup, organizationOfficers: OrganizationOfficer[]}): DialogRef {
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
      publicTerms: controls ? [{value: publicTerms, disabled: true}] : publicTerms,
      customTerms: controls ? [customTerms] : customTerms
    }
  }
}
