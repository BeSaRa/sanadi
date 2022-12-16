import {AdminResult} from "@app/models/admin-result";
import {CaseModel} from "@app/models/case-model";
import {ProjectFundraisingService} from "@services/project-fundraising.service";
import {CaseTypes} from "@app/enums/case-types.enum";
import {FactoryService} from "@services/factory.service";
import {CustomValidators} from "@app/validators/custom-validators";
import {ProjectTemplate} from "@app/models/projectTemplate";
import {DeductedPercentage} from "@app/models/deducted-percentage";
import {AmountOverYear} from "@app/models/amount-over-year";
import {AmountOverCountry} from "@app/models/amount-over-country";
import {ProjectFundraisingInterceptor} from "@app/model-interceptors/project-fundraising-interceptor";
import {InterceptModel} from "@decorators/intercept-model";
import {EmployeeService} from "@services/employee.service";
import currency from "currency.js";

const {send, receive} = new ProjectFundraisingInterceptor()

@InterceptModel({send, receive})
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
  administrativeDeductionAmount: number = 0
  targetAmount: number = 0
  projectTotalCost: number = 0
  description!: string
  templateList: ProjectTemplate[] = []
  deductedPercentagesItemList: DeductedPercentage[] = []
  amountOverYearsList: AmountOverYear[] = []
  amountOverCountriesList: AmountOverCountry[] = []
  countriesInfo: AdminResult[] = []
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
  licenseClassName!: string;

  // extra properties
  employeeService: EmployeeService;

  constructor() {
    super();
    this.service = FactoryService.getService('ProjectFundraisingService');
    this.employeeService = FactoryService.getService('EmployeeService');
    this.finalizeSearchFields();
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
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
      description: controls ? [description, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : description,
    }
  }

  setTemplate(template: ProjectTemplate): boolean {
    this.templateList = [template]
    return true
  }

  getTemplateId(): string | undefined {
    return this.templateList && this.templateList.length ? this.templateList[0].templateId : undefined;
  }

  hasTemplate(): boolean {
    return !!(this.templateList && this.templateList.length)
  }

  clearTemplate(): ProjectFundraising {
    this.templateList = []
    return this;
  }

  addDeductionRatioItem(item: DeductedPercentage): ProjectFundraising {
    this.deductedPercentagesItemList = this.deductedPercentagesItemList.concat([item])
    return this
  }

  updateDeductionRatioItem(deductionType: number, amount: number): void {
    this.deductedPercentagesItemList = this.deductedPercentagesItemList.map(item => {
      item.deductionType === deductionType ? (item.deductionPercent = amount) : null
      return item
    })
  }

  removeDeductionRatioItem(deductionItem: DeductedPercentage): ProjectFundraising {
    this.deductedPercentagesItemList = this.deductedPercentagesItemList.filter(item => item.deductionType !== deductionItem.deductionType)
    return this;
  }

  removeYear(year: AmountOverYear): ProjectFundraising {
    this.amountOverYearsList = this.amountOverYearsList.filter(item => !(year.targetAmount === item.targetAmount && year.year === item.year))
    return this;
  }

  clearDeductionItems(): void {
    this.deductedPercentagesItemList = []
  }

  setProjectTotalCost(cost: number): ProjectFundraising {
    this.projectTotalCost = cost
    return this
  }

  setTargetAmount(cost: number): ProjectFundraising {
    this.targetAmount = cost
    return this
  }

  addYear(value: AmountOverYear): ProjectFundraising {
    this.amountOverYearsList = this.amountOverYearsList.concat([value])
    return this
  }

  removeYearByName(yearName: string): ProjectFundraising {
    this.amountOverYearsList = this.amountOverYearsList.filter(year => year.year !== yearName)
    return this;
  }

  removeYearsExcept(yearsName: string[]): ProjectFundraising {
    this.amountOverYearsList = this.amountOverYearsList.filter(item => yearsName.includes(item.year))
    return this
  }

  updateYear(value: number, index: number): ProjectFundraising {
    this.amountOverYearsList = this.amountOverYearsList.map((item, i) => {
      if (index == i)
        item.targetAmount = value
      return item
    })
    return this;
  }

  addCountry(country: AmountOverCountry): void {
    this.amountOverCountriesList = this.amountOverCountriesList.concat([country])
  }

  removeCountry(id: number): void {
    this.amountOverCountriesList = this.amountOverCountriesList.filter(item => item.country !== id)
  }

  calculateAllCountriesAmount(): number {
    return this.amountOverCountriesList.reduce((acc, country) => currency(acc).add(country.targetAmount).value, 0)
  }

  calculateAllCountriesExcept(countryId: number): number {
    return this.amountOverCountriesList.reduce((acc, country) => {
      return acc + (country.country == countryId ? 0 : country.targetAmount)
    }, 0)
  }


  beforeSend(): void {
    this.templateList = this.templateList!.map((item: ProjectTemplate) => {
      return item.clone({
        ...item,
        searchFields: undefined,
        templateStatusInfo: undefined,
        publicStatusInfo: undefined
      })
    })

    this.deductedPercentagesItemList = this.deductedPercentagesItemList!.map((item: DeductedPercentage) => {
      return item.clone({
        ...item,
        deductionTypeInfo: undefined
      })
    })

    this.amountOverCountriesList = this.amountOverCountriesList!.map((item) => {
      return item.clone({
        ...item,
        countryInfo: undefined
      })
    })
  }

  updateCountryAmount(countryId: number, correctedAmount: number) {
    this.amountOverCountriesList = this.amountOverCountriesList.map(country => {
      country.country === countryId ? (country.targetAmount = correctedAmount) : null
      return country
    })
  }
}
