import {AdminResult} from "@app/models/admin-result";
import {CaseModel} from "@app/models/case-model";
import {ProjectFundraisingService} from "@services/project-fundraising.service";
import {CaseTypes} from "@app/enums/case-types.enum";
import {FactoryService} from "@services/factory.service";
import {CustomValidators} from "@app/validators/custom-validators";
import {Template} from "@app/models/template";
import {DeductedPercentage} from "@app/models/deducted-percentage";
import {AmountOverYear} from "@app/models/amount-over-year";
import {AmountOverCountry} from "@app/models/amount-over-country";

export class ProjectFundraising extends CaseModel<ProjectFundraisingService, ProjectFundraising> {
  service: ProjectFundraisingService;
  caseType: number = CaseTypes.PROJECT_FUNDRAISING
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
  templateList!: Template[]
  deductedPercentagesItemList: DeductedPercentage[] = []
  amountOverYearsList!: AmountOverYear[]
  amountOverCountriesList!: AmountOverCountry[]
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

  buildBasicInfo(controls: boolean = false): any {
    const {
      requestType,
      permitType,
      projectWorkArea,
      countries,
      domain,
      mainDACCategory,
      subDACCategory,
      mainUNOCHACategory,
      subUNOCHACategory,
      projectType,
      internalProjectClassification,
      sanadiDomain,
      sanadiMainClassification,
      licenseDuration,
      oldLicenseFullSerial,
      projectTotalCost,
      oldLicenseId,
      oldLicenseSerial
    } = this;
    return {
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      permitType: controls ? [permitType, [CustomValidators.required]] : permitType,
      projectWorkArea: controls ? [projectWorkArea, [CustomValidators.required]] : projectWorkArea,
      countries: controls ? [countries, [CustomValidators.requiredArray]] : countries,
      domain: controls ? [domain] : domain,
      oldLicenseFullSerial: controls ? [oldLicenseFullSerial, [CustomValidators.maxLength(250)]] : oldLicenseFullSerial,
      oldLicenseId: controls ? [oldLicenseId] : oldLicenseId,
      oldLicenseSerial: controls ? [oldLicenseSerial] : oldLicenseSerial,
      mainDACCategory: controls ? [mainDACCategory] : mainDACCategory,
      subDACCategory: controls ? [subDACCategory] : subDACCategory,
      mainUNOCHACategory: controls ? [mainUNOCHACategory] : mainUNOCHACategory,
      subUNOCHACategory: controls ? [subUNOCHACategory] : subUNOCHACategory,
      projectType: controls ? [projectType] : projectType,
      internalProjectClassification: controls ? [internalProjectClassification] : internalProjectClassification,
      sanadiDomain: controls ? [sanadiDomain] : sanadiDomain,
      sanadiMainClassification: controls ? [sanadiMainClassification] : sanadiMainClassification,
      licenseDuration: controls ? [licenseDuration, [CustomValidators.required]] : licenseDuration,
      projectTotalCost: controls ? [projectTotalCost, [CustomValidators.required]] : projectTotalCost,
    }
  }

  buildExplanation(controls: boolean = false): any {
    const {description} = this;
    return {
      description: controls ? [description, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : description,
    }
  }
}
