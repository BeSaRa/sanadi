import { AdminResult } from "@app/models/admin-result";
import { CaseModel } from "@app/models/case-model";
import { ProjectFundraisingService } from "@services/project-fundraising.service";
import { CaseTypes } from "@app/enums/case-types.enum";
import { FactoryService } from "@services/factory.service";

export class ProjectFundraising extends CaseModel<ProjectFundraisingService, ProjectFundraising> {
  service: ProjectFundraisingService;
  caseType: number = CaseTypes.FUNDRAISING_LICENSING
  licenseDuration!: number
  licenseStatus!: number
  licenseStartDate!: string
  licenseEndDate!: string
  oldLicenseId!: string
  oldLicenseSerial!: number
  oldLicenseFullSerial!: string
  exportedLicenseFullSerial!: string
  exportedLicenseId!: string
  exportedLicenseSerial!: number
  licenseVSID!: string
  customTerms!: string
  publicTerms!: string
  licenseStatusInfo!: AdminResult
  requestType!: number
  subject!: string
  conditionalLicenseIndicator!: boolean
  countries!: string[]
  domain!: number
  followUpDate!: string
  permitType!: number
  projectType!: number
  projectWorkArea!: number
  mainDACCategory!: number
  mainUNOCHACategory!: number
  subUNOCHACategory!: number
  subDACCategory!: number
  internalProjectClassification!: number
  sanadiDomain!: number
  sanadiMainClassification!: number
  administrativeDeductionAmount!: number
  targetAmount!: number
  projectTotalCost!: number
  description!: string
  templateList!: any[]
  deductedPercentagesItemList!: any[]
  amountOverYearsList!: any[]
  amountOverCountriesList!: any[]
  countriesInfo!: AdminResult
  domainInfo!: AdminResult
  workAreaInfo!: AdminResult
  permitTypeInfo!: AdminResult
  projectTypeInfo!: AdminResult
  mainDACCategoryInfo!: AdminResult
  mainUNOCHACategoryInfo!: AdminResult
  subUNOCHACategoryInfo!: AdminResult
  subDACCategoryInfo!: AdminResult
  internalProjectClassificationInfo!: AdminResult
  sanadiDomainInfo!: AdminResult
  sanadiMainClassificationInfo!: AdminResult
  requestTypeInfo!: AdminResult
  inRenewalPeriod!: boolean
  usedInProjectCompletion!: boolean
  licenseClassName!: string

  constructor() {
    super();
    this.service = FactoryService.getService('ProjectFundraisingService')
  }
}
