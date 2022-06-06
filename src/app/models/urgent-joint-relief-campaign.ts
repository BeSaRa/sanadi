import {CaseModel} from '@app/models/case-model';
import {UrgentJointReliefCampaignService} from '@services/urgent-joint-relief-campaign.service';
import {CaseTypes} from '@app/enums/case-types.enum';
import {UrgentJointReliefCampaignInterceptor} from '@app/model-interceptors/urgent-joint-relief-campaign-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {AdminResult} from '@app/models/admin-result';
import {FactoryService} from '@services/factory.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {IMyDateModel} from 'angular-mydatepicker';

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
  organizaionOfficerList!: any[];
  requestTypeInfo!: AdminResult;
  beneficiaryCountryInfo!: AdminResult;
  participatingOrganizaionList: {organizationId: number, arabicName: string, englishName: string}[] = [];

  constructor() {
    super();
    this.service = FactoryService.getService('UrgentJointReliefCampaignService');
  }

  buildBasicInfo(controls: boolean = false): any {
    const {fullName, licenseStartDate, licenseEndDate, phone, extraPhone, approvalPeriod, beneficiaryCountry, targetAmount} = this;
    return {
      fullName: controls ? [fullName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : fullName,
      licenseStartDate: controls ? [licenseStartDate, [CustomValidators.required]] : licenseStartDate,
      licenseEndDate: controls ? [licenseEndDate, [CustomValidators.required]] : licenseEndDate,
      phone: controls ? [phone, [CustomValidators.required]] : phone,
      extraPhone: controls ? [extraPhone, []] : extraPhone,
      approvalPeriod: controls ? [approvalPeriod, [CustomValidators.required]] : approvalPeriod,
      beneficiaryCountry: controls ? [beneficiaryCountry, [CustomValidators.required]] : beneficiaryCountry,
      targetAmount: controls ? [targetAmount, [CustomValidators.required]] : targetAmount
    }
  }

  buildExplanation(controls: boolean = false): any {
    const {description} = this;
    return {
      description: controls ? [description, [CustomValidators.required]] : description,
    }
  }

  getCaseStatus() {
    return this.caseType;
  }
}
