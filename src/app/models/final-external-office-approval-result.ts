import { BaseLicense } from '@app/models/base-license';
import { AdminResult } from '@app/models/admin-result';
import { ExecutiveManagement } from '@app/models/executive-management';
import { BankBranch } from '@app/models/bank-branch';
import { BankAccount } from '@app/models/bank-account';
import { CaseTypes } from '@app/enums/case-types.enum';
import { InterceptModel } from '@decorators/intercept-model';
import { FinalExternalOfficeApprovalResultInterceptor } from '@app/model-interceptors/final-external-office-approval-result-interceptor';
import { OrgBranch } from './org-branch';
import { CharityBranch } from './charity-branch';
import { OrgMember } from './org-member';

const { send, receive } = new FinalExternalOfficeApprovalResultInterceptor();
@InterceptModel({ send, receive })
export class FinalExternalOfficeApprovalResult extends BaseLicense {
  enName!: string;
  arName!: string;
  caseType: number = CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL;
  country!: number;
  region!: string;
  establishmentDate!: string;
  phone!: string;
  fax!: string;
  postalCode!: string;
  email!: string;
  customTerms!: string;
  publicTerms!: string;
  countryInfo!: AdminResult;
  // regionInfo!: AdminResult;
  externalOfficeName!: string;
  recordNo!: string;

  executiveManagementList: ExecutiveManagement[] = [];
  branchList: BankBranch[] = [];
  bankAccountList: BankAccount[] = [];
  caseStatus!: number;
  caseStatusInfo!: AdminResult;
  chiefDecision?: number;
  chiefDecisionInfo!: AdminResult;
  conditionalLicenseIndicator: boolean = false;
  followUpDate!: string;
  fullSerial!: string;
  inRenewalPeriod: boolean = false;
  managerDecision?: number;
  managerDecisionInfo!: AdminResult;
  organizationId!: number;
  ouInfo!: AdminResult;
  requestType!: number;
  requestTypeInfo!: AdminResult;
  reviewerDepartmentDecision?: number;
  reviewerDepartmentDecisionInfo!: AdminResult;
  serial!: string;
  specialistDecision?: number;
  specialistDecisionInfo!: AdminResult;
  subject: string = '';

  buildForm(controls = true) {
    const { country, region, recordNo, phone, fax, postalCode, email } = this;
    return {
      country: controls ? [country] : country,
      region: controls ? [region] : region,
      recordNo: controls ? [recordNo] : recordNo,
      phone: controls ? [phone] : phone,
      fax: controls ? [fax] : fax,
      postalCode: controls ? [postalCode] : postalCode,
      email: controls ? [email] : email,
    };
  }
}
