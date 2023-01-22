import {CaseModel} from "@app/models/case-model";
import {ProjectImplementationService} from "@services/project-implementation.service";
import {InterceptModel} from "@decorators/intercept-model";
import {FactoryService} from "@services/factory.service";
import {ProjectImplementationInterceptor} from "@model-interceptors/project-implementation-interceptor";
import {CaseTypes} from "@app/enums/case-types.enum";
import {HasLicenseApprovalMonthly} from "@contracts/has-license-approval-monthly";
import {mixinApprovalLicenseWithMonthly} from "@app/mixins/mixin-approval-license-with-monthly";
import {mixinRequestType} from "@app/mixins/mixin-request-type";
import {HasRequestType} from "@app/interfaces/has-request-type";
import {AdminResult} from "@models/admin-result";
import {CaseModelContract} from "@contracts/case-model-contract";
import {ImplementationTemplate} from "@models/implementation-template";
import {ImplementationFundraising} from "@models/implementation-fundraising";
import {FundingResourceContract} from "@contracts/funding-resource-contract";
import {Payment} from "@models/payment";
import {ImplementingAgency} from "@models/implementing-agency";
import {CustomValidators} from "@app/validators/custom-validators";
import currency from "currency.js";

const _Approval = mixinApprovalLicenseWithMonthly(mixinRequestType(CaseModel))
const {send, receive} = new ProjectImplementationInterceptor()

@InterceptModel({send, receive})
export class ProjectImplementation
  extends _Approval<ProjectImplementationService, ProjectImplementation>
  implements CaseModelContract<ProjectImplementationService, ProjectImplementation>, HasLicenseApprovalMonthly, HasRequestType {
  service: ProjectImplementationService;
  caseType = CaseTypes.PROJECT_IMPLEMENTATION;
  lastModified!: string
  classDescription!: string
  subject!: string
  projectWorkArea!: number
  mainDACCategory!: number
  mainUNOCHACategory!: number
  subUNOCHACategory!: number
  subDACCategory!: number
  internalProjectClassification!: number
  implementingAgencyType!: number
  projectEvaluationSLA!: number
  description!: string
  domain!: number
  fundingTotalCost!: number
  paymentTotalCost!: number
  beneficiaryCountry!: number
  implementationTemplate: ImplementationTemplate[] = []
  implementingAgencyList: ImplementingAgency[] = []
  implementationFundraising: ImplementationFundraising[] = []
  financialGrant: FundingResourceContract[] = []
  selfFinancing: FundingResourceContract[] = []
  payment: Payment[] = []
  beneficiaryCountryInfo!: AdminResult
  domainInfo!: AdminResult
  mainUNOCHACategoryInfo!: AdminResult
  subUNOCHACategoryInfo!: AdminResult
  mainDACCategoryInfo!: AdminResult
  subDACCategoryInfo!: AdminResult
  workAreaInfo!: AdminResult
  internalProjectClassificationInfo!: AdminResult
  implementingAgencyTypeInfo!: AdminResult
  creatorInfo!: AdminResult
  ouInfo!: AdminResult
  licenseStatusInfo!: AdminResult
  inRenewalPeriod!: boolean
  usedInProjectCompletion!: boolean
  licenseClassName!: string;
  projectTotalCost!: number

  constructor() {
    super();
    this.service = FactoryService.getService('ProjectImplementationService')
  }

  buildBasicInfo(controls: boolean = false) {
    const {
      requestType,
      oldLicenseFullSerial,
      projectWorkArea,
      beneficiaryCountry,
      domain,
      mainDACCategory,
      mainUNOCHACategory,
      subDACCategory,
      subUNOCHACategory,
      internalProjectClassification
    } = this;

    return {
      requestType: controls ? [requestType, [CustomValidators.required], []] : requestType,
      oldLicenseFullSerial: controls ? [oldLicenseFullSerial, [CustomValidators.maxLength(250)], []] : oldLicenseFullSerial,
      projectWorkArea: controls ? [projectWorkArea, [CustomValidators.required], []] : projectWorkArea,
      beneficiaryCountry: controls ? [beneficiaryCountry, [CustomValidators.required], []] : beneficiaryCountry,
      domain: controls ? [domain, [], []] : domain,
      mainDACCategory: controls ? [mainDACCategory, [], []] : mainDACCategory,
      mainUNOCHACategory: controls ? [mainUNOCHACategory, [], []] : mainUNOCHACategory,
      subDACCategory: controls ? [subDACCategory, [], []] : subDACCategory,
      subUNOCHACategory: controls ? [subUNOCHACategory, [], []] : subUNOCHACategory,
      internalProjectClassification: controls ? [internalProjectClassification, [], []] : internalProjectClassification
    }
  }

  buildProjectInfo(controls: boolean = false) {
    const {
      implementationTemplate,
      implementingAgencyType,
      licenseStartDate,
      projectEvaluationSLA,
      licenseDuration,
      implementingAgencyList
    } = this
    return {
      licenseStartDate: controls ? [licenseStartDate, CustomValidators.required] : licenseStartDate,
      licenseDuration: controls ? [licenseDuration, CustomValidators.required] : licenseDuration,
      projectEvaluationSLA: controls ? [projectEvaluationSLA, CustomValidators.required] : projectEvaluationSLA,
      implementingAgencyType: controls ? [implementingAgencyType, CustomValidators.required] : implementingAgencyType,
      implementationTemplate: controls ? [implementationTemplate, CustomValidators.requiredArray] : implementationTemplate,
      implementingAgencyList: controls ? [implementingAgencyList, CustomValidators.requiredArray] : implementingAgencyList
    }
  }

  buildSpecialInfo(controls: boolean) {
    return {
      description: controls ? [this.description, [CustomValidators.required]] : this.description
    };
  }

  setImplementationTemplate(template: ImplementationTemplate): void {
    this.implementationTemplate = [template]
    this.setProjectTotalCost(template.projectTotalCost)
  }

  removeImplementationTemplate(): void {
    this.implementationTemplate = []
  }

  setProjectTotalCost(value: number): void {
    this.projectTotalCost = currency(value).value
  }

  buildFundingResources(controls: boolean = false) {
    const {
      implementationFundraising,
      financialGrant,
      selfFinancing,
      payment
    } = this
    return {
      implementationFundraising: controls ? [implementationFundraising] : implementationFundraising,
      financialGrant: controls ? [financialGrant] : financialGrant,
      selfFinancing: controls ? [selfFinancing] : selfFinancing,
      payment: controls ? [payment] : payment,
    };
  }
}
