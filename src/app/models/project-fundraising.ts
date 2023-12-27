import { ControlValueLabelLangKey } from './../types/types';
import { AdminResult } from "@app/models/admin-result";
import { CaseModel } from "@app/models/case-model";
import { ProjectFundraisingService } from "@services/project-fundraising.service";
import { CaseTypes } from "@app/enums/case-types.enum";
import { FactoryService } from "@services/factory.service";
import { CustomValidators } from "@app/validators/custom-validators";
import { ProjectTemplate } from "@app/models/projectTemplate";
import { DeductedPercentage } from "@app/models/deducted-percentage";
import { AmountOverYear } from "@app/models/amount-over-year";
import { AmountOverCountry } from "@app/models/amount-over-country";
import { ProjectFundraisingInterceptor } from "@app/model-interceptors/project-fundraising-interceptor";
import { InterceptModel } from "@decorators/intercept-model";
import { EmployeeService } from "@services/employee.service";
import currency from "currency.js";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { WFResponseType } from "@app/enums/wfresponse-type.enum";
import { mixinApprovalLicenseWithMonthly } from "@app/mixins/mixin-approval-license-with-monthly";
import { mixinRequestType } from "@app/mixins/mixin-request-type";
import { ICaseModel } from "@contracts/icase-model";
import { HasLicenseApprovalMonthly } from "@contracts/has-license-approval-monthly";
import { CaseModelContract } from "@contracts/case-model-contract";
import { DomainTypes } from "@app/enums/domain-types";
import { ProjectPermitTypes } from "@app/enums/project-permit-types";
import { TemplateStatus } from "@app/enums/template-status";
import { ServiceRequestTypes } from "@app/enums/service-request-types";
import { PublicTemplateStatus } from "@app/enums/public-template-status";
import { ImplementationFundraising } from "@models/implementation-fundraising";
import { AuditOperationTypes } from "@app/enums/audit-operation-types";
import { CommonUtils } from "@app/helpers/common-utils";
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import {ILanguageKeys} from "@contracts/i-language-keys";

const { send, receive } = new ProjectFundraisingInterceptor()
const _ApprovalLicenseWithMonthly = mixinRequestType(mixinApprovalLicenseWithMonthly(CaseModel))

@InterceptModel({ send, receive })
export class ProjectFundraising extends _ApprovalLicenseWithMonthly<ProjectFundraisingService, ProjectFundraising>
  implements HasLicenseApprovalMonthly, IAuditModelProperties<ProjectFundraising>,
  ICaseModel<ProjectFundraising>,
  CaseModelContract<ProjectFundraisingService, ProjectFundraising> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
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
  licenseVSID!: string;
  vsId!: string;
  collected!: number;
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
  orgInfo!: AdminResult;
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

  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: { langKey: 'request_type', value: this.requestType },
      permitType: { langKey: 'permit_type', value: this.permitType },
      projectWorkArea: { langKey: 'project_work_area', value: this.projectWorkArea },
      countries: { langKey: 'country_countries', value: this.countries },
      domain: { langKey: 'domain', value: this.domain },
      mainDACCategory: { langKey: 'main_dac_category', value: this.mainDACCategory },
      subDACCategory: { langKey: 'sub_dac_category', value: this.subDACCategory },
      mainUNOCHACategory: { langKey: 'main_unocha_category', value: this.mainUNOCHACategory },
      subUNOCHACategory: { langKey: 'sub_unocha_category', value: this.subUNOCHACategory },
      projectType: { langKey: 'project_type', value: this.projectType },
      internalProjectClassification: { langKey: 'internal_projects_classification', value: this.internalProjectClassification },
      sanadiDomain: { langKey: 'sanady_domain', value: this.sanadiDomain },
      sanadiMainClassification: { langKey: 'sanady_main_classification', value: this.sanadiMainClassification },
      licenseDuration: { langKey: 'license_duration', value: this.licenseDuration },
      oldLicenseFullSerial: { langKey: 'license_number', value: this.oldLicenseFullSerial },
      oldLicenseId: { langKey: {} as keyof ILanguageKeys, value: this.oldLicenseId, skipAuditComparison: true },
      oldLicenseSerial: { langKey: {} as keyof ILanguageKeys, value: this.oldLicenseSerial, skipAuditComparison: true },
      projectTotalCost: { langKey: 'project_total_cost', value: this.projectTotalCost },
    };
  }
  getAdminResultByProperty(property: keyof ProjectFundraising): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'domain':
        adminResultValue = this.domainInfo;
        break;
      case 'projectWorkArea':
        adminResultValue = this.workAreaInfo;
        break;
      case 'permitType':
        adminResultValue = this.permitTypeInfo;
        break;
      case 'projectType':
        adminResultValue = this.projectTypeInfo;
        break;
      case 'mainDACCategory':
        adminResultValue = this.mainDACCategoryInfo;
        break;
      case 'mainUNOCHACategory':
        adminResultValue = this.mainUNOCHACategoryInfo;
        break;
      case 'subUNOCHACategory':
        adminResultValue = this.subUNOCHACategoryInfo;
        break;
      case 'subDACCategory':
        adminResultValue = this.subDACCategoryInfo;
        break;
      case 'internalProjectClassification':
        adminResultValue = this.internalProjectClassificationInfo;
        break;
      case 'sanadiDomain':
        adminResultValue = this.sanadiDomainInfo;
        break;
      case 'sanadiMainClassification':
        adminResultValue = this.sanadiMainClassificationInfo;
        break;
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'countries':
        adminResultValue = new AdminResult();
        this.countriesInfo.forEach(bp => {
          adminResultValue.arName += bp.arName;
          adminResultValue.enName += bp.enName;
        })
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
  buildBasicInfo(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<ProjectFundraising>(this.getBasicInfoValuesWithLabels())

    return {
      requestType: controls ? [values.requestType, [CustomValidators.required]] : values.requestType,
      permitType: controls ? [values.permitType, [CustomValidators.required]] : values.permitType,
      projectWorkArea: controls ? [values.projectWorkArea, [CustomValidators.required]] : values.projectWorkArea,
      countries: controls ? [values.countries] : values.countries,
      domain: controls ? [values.domain] : values.domain,
      oldLicenseFullSerial: controls ? [values.oldLicenseFullSerial, [CustomValidators.maxLength(250)]] : values.oldLicenseFullSerial,
      oldLicenseId: controls ? [values.oldLicenseId] : values.oldLicenseId,
      oldLicenseSerial: controls ? [values.oldLicenseSerial] : values.oldLicenseSerial,
      mainDACCategory: controls ? [values.mainDACCategory] : values.mainDACCategory,
      subDACCategory: controls ? [values.subDACCategory] : values.subDACCategory,
      mainUNOCHACategory: controls ? [values.mainUNOCHACategory] : values.mainUNOCHACategory,
      subUNOCHACategory: controls ? [values.subUNOCHACategory] : values.subUNOCHACategory,
      projectType: controls ? [values.projectType] : values.projectType,
      internalProjectClassification: controls ? [values.internalProjectClassification] : values.internalProjectClassification,
      sanadiDomain: controls ? [values.sanadiDomain] : values.sanadiDomain,
      sanadiMainClassification: controls ? [values.sanadiMainClassification] : values.sanadiMainClassification,
      licenseDuration: controls ? [values.licenseDuration, [CustomValidators.required]] : values.licenseDuration,
      projectTotalCost: controls ? [values.projectTotalCost, [CustomValidators.required]] : values.projectTotalCost,
    }
  }

  getExplanationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      description: { langKey: 'special_explanations', value: this.description },
    }
  }
  buildExplanation(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<ProjectFundraising>(this.getExplanationValuesWithLabels())
    return {
      description: controls ? [values.description, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.description,
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
      || this.deductedPercentagesItemList.some(item => item.deductionPercent < 0)
      || this.calculateAllYearsAmount() !== this.targetAmount
      || (ignoreCountries ? false : this.calculateAllCountriesAmount() !== this.targetAmount)
      || (ignoreCountries ? false : this.amountOverCountriesList.some(item => item.targetAmount <= 0))
      || this.amountOverYearsList.some(item => item.targetAmount <= 0)
      || this.administrativeDeductionAmount < 0
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
      projectLicenseId: this.licenseVSID || this.vsId,
      projectTotalCost: this.targetAmount,
      permitType: this.permitType,
      permitTypeInfo: this.permitTypeInfo,
      totalCost: 0,
      templateId: this.getTemplateId(),
      isMain: false
    })
  }
}
