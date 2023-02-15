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
import {DialogRef} from "@app/shared/models/dialog-ref";
import {WFResponseType} from "@app/enums/wfresponse-type.enum";
import {mixinApprovalLicenseWithMonthly} from "@app/mixins/mixin-approval-license-with-monthly";
import {mixinRequestType} from "@app/mixins/mixin-request-type";
import {ICaseModel} from "@contracts/icase-model";
import {HasLicenseApprovalMonthly} from "@contracts/has-license-approval-monthly";
import {CaseModelContract} from "@contracts/case-model-contract";
import {DomainTypes} from "@app/enums/domain-types";
import {ProjectPermitTypes} from "@app/enums/project-permit-types";
import {TemplateStatus} from "@app/enums/template-status";
import {ServiceRequestTypes} from "@app/enums/service-request-types";
import {PublicTemplateStatus} from "@app/enums/public-template-status";
import {ImplementationFundraising} from "@models/implementation-fundraising";

const {send, receive} = new ProjectFundraisingInterceptor()
const _ApprovalLicenseWithMonthly = mixinRequestType(mixinApprovalLicenseWithMonthly(CaseModel))

@InterceptModel({send, receive})
export class ProjectFundraising extends _ApprovalLicenseWithMonthly<ProjectFundraisingService, ProjectFundraising>
  implements HasLicenseApprovalMonthly,
    ICaseModel<ProjectFundraising>,
    CaseModelContract<ProjectFundraisingService, ProjectFundraising> {

  service: ProjectFundraisingService;
  caseType: number = CaseTypes.PROJECT_FUNDRAISING
  licenseDuration!: number
  totalLicenseDuration!: number
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
  countries: string[] = []
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
  arName!: string;
  enName!: string;
  // extra properties
  employeeService: EmployeeService;
  consumed?: number

  constructor() {
    super();
    this.service = FactoryService.getService('ProjectFundraisingService');
    this.employeeService = FactoryService.getService('EmployeeService');
    this.finalizeSearchFields();
  }

  licenseDurationType!: number;
  itemId!: string;

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
      countries: controls ? [countries] : countries,
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

  getTemplate(): ProjectTemplate | undefined {
    return this.templateList && this.templateList.length ? this.templateList[0] : undefined
  }

  hasTemplate(): boolean {
    return !!(this.templateList && this.templateList.length)
  }

  hasCountries(): boolean {
    return !!(this.amountOverCountriesList && this.amountOverCountriesList.length)
  }

  hasYears(): boolean {
    return !!(this.amountOverYearsList && this.amountOverYearsList.length)
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

  removeYear(year: AmountOverYear): ProjectFundraising {
    this.amountOverYearsList = this.amountOverYearsList.filter(item => !(year.targetAmount === item.targetAmount && year.year === item.year))
    return this;
  }

  calculateAllCountriesAmount(): number {
    return this.amountOverCountriesList.reduce((acc, country) => currency(acc).add(country.targetAmount).value, 0)
  }

  calculateAllYearsAmount(): number {
    return this.amountOverYearsList.reduce((acc, year) => currency(acc).add(year.targetAmount).value, 0)
  }

  calculateAllCountriesExcept(countryId: number): number {
    return this.amountOverCountriesList.reduce((acc, country) => {
      return acc + (country.country == countryId ? 0 : country.targetAmount)
    }, 0)
  }

  calculateAllYearsExcept(yearName: string): number {
    return this.amountOverYearsList.reduce((acc, year) => {
      return currency(acc).add(year.year == yearName ? 0 : year.targetAmount).value
    }, 0)
  }


  beforeSend(): void {
    this.templateList = this.templateList!.map((item: ProjectTemplate) => {
      return item.clone({
        ...item,
        searchFields: undefined,
        templateStatusInfo: undefined,
        publicStatusInfo: undefined,
        service: undefined
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


  hasInvalidTargetAmount(ignoreCountries: boolean = false): boolean {
    return !this.deductedPercentagesItemList.length
      || this.deductedPercentagesItemList.some(item => item.deductionPercent <= 0)
      || this.calculateAllYearsAmount() !== this.targetAmount
      || (ignoreCountries ? false : this.calculateAllCountriesAmount() !== this.targetAmount)
      || (ignoreCountries ? false : this.amountOverCountriesList.some(item => item.targetAmount <= 0))
      || this.amountOverYearsList.some(item => item.targetAmount <= 0)
      || this.administrativeDeductionAmount <= 0
  }

  approve(): DialogRef {
    return [ServiceRequestTypes.CANCEL, ServiceRequestTypes.UPDATE].includes(this.requestType) ? super.approve() : this.service.approveTask(this, WFResponseType.APPROVE);
  }

  finalApprove(): DialogRef {
    return [ServiceRequestTypes.CANCEL, ServiceRequestTypes.UPDATE].includes(this.requestType) ? super.approve(WFResponseType.FINAL_APPROVE) : this.service.approveTask(this, WFResponseType.FINAL_APPROVE);
  }

  clearYears(): void {
    this.amountOverYearsList = []
  }

  clearCountries(): void {
    this.amountOverCountriesList = []
  }

  hasValidApprovalInfo(): boolean {
    return !!this.licenseDuration
  }

  getDacOchaId(): number | null {
    return this.domain === DomainTypes.DEVELOPMENT ? this.mainDACCategory :
      this.domain === DomainTypes.HUMANITARIAN &&
      this.permitType !== ProjectPermitTypes.SECTIONAL_BASKET ?
        this.mainUNOCHACategory : null;
  }

  changeTemplateStatus(index: number, status: TemplateStatus): boolean {
    this.templateList[index].templateStatus = status
    return true
  }

  canApproveTemplate(index: number = 0) {
    return this.templateList[index].publicStatus !== PublicTemplateStatus.APPROVED_BY_RACA;
  }

  convertToFundraisingTemplate(): ImplementationFundraising {
    return new ImplementationFundraising().clone({
      arabicName: this.arName,
      englishName: this.enName,
      projectLicenseFullSerial: this.fullSerial,
      projectLicenseSerial: this.serial,
      projectLicenseId: this.id,
      projectTotalCost: this.targetAmount,
      permitType: this.permitType,
      permitTypeInfo: this.permitTypeInfo,
      totalCost: 0,
      templateId: this.getTemplateId(),
      isMain: false
    })
  }
}
