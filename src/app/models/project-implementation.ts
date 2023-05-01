import { ControlValueLabelLangKey } from './../types/types';
import { CaseModel } from "@app/models/case-model";
import { ProjectImplementationService } from "@services/project-implementation.service";
import { InterceptModel } from "@decorators/intercept-model";
import { FactoryService } from "@services/factory.service";
import { ProjectImplementationInterceptor } from "@model-interceptors/project-implementation-interceptor";
import { CaseTypes } from "@app/enums/case-types.enum";
import { HasLicenseApprovalMonthly } from "@contracts/has-license-approval-monthly";
import { mixinApprovalLicenseWithMonthly } from "@app/mixins/mixin-approval-license-with-monthly";
import { mixinRequestType } from "@app/mixins/mixin-request-type";
import { HasRequestType } from "@app/interfaces/has-request-type";
import { AdminResult } from "@models/admin-result";
import { CaseModelContract } from "@contracts/case-model-contract";
import { ImplementationTemplate } from "@models/implementation-template";
import { ImplementationFundraising } from "@models/implementation-fundraising";
import { FundingResourceContract } from "@contracts/funding-resource-contract";
import { Payment } from "@models/payment";
import { ImplementingAgency } from "@models/implementing-agency";
import { CustomValidators } from "@app/validators/custom-validators";
import currency from "currency.js";
import { Validators } from "@angular/forms";
import { ImplementationTemplateInterceptor } from "@model-interceptors/implementation-template-interceptor";
import { ImplementingAgencyInterceptor } from "@model-interceptors/implementing-agency-interceptor";
import { DateUtils } from "@helpers/date-utils";
import { IMyDateModel } from "angular-mydatepicker";
import { ImplementationFundraisingInterceptor } from "@model-interceptors/implementation-fundraising-interceptor";
import { ISearchFieldsMap } from '@app/types/types';
import { dateSearchFields } from '@helpers/date-search-fields';
import { infoSearchFields } from '@helpers/info-search-fields';
import { normalSearchFields } from '@helpers/normal-search-fields';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { SubmissionMechanisms } from '@app/enums/submission-mechanisms.enum';
import { AllRequestTypesEnum } from "@app/enums/all-request-types-enum";
import { AuditOperationTypes } from "@app/enums/audit-operation-types";
import { CommonUtils } from '@app/helpers/common-utils';

const _Approval = mixinApprovalLicenseWithMonthly(mixinRequestType(CaseModel))
const { send, receive } = new ProjectImplementationInterceptor()

@InterceptModel({ send, receive })
export class ProjectImplementation
  extends _Approval<ProjectImplementationService, ProjectImplementation>
  implements CaseModelContract<ProjectImplementationService, ProjectImplementation>, HasLicenseApprovalMonthly, HasRequestType {
  service: ProjectImplementationService;
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
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
  projectTotalCost: number = 0

  searchFields: ISearchFieldsMap<ProjectImplementation> = {
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
    this.service = FactoryService.getService('ProjectImplementationService');
    this.finalizeSearchFields();
  }

  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: { langKey: 'request_type', value: this.requestType },
      oldLicenseFullSerial: { langKey: 'serial_number', value: this.oldLicenseFullSerial },
      projectWorkArea: { langKey: 'project_work_area', value: this.projectWorkArea },
      beneficiaryCountry: { langKey: 'beneficiary_country', value: this.beneficiaryCountry },
      domain: { langKey: 'domain', value: this.domain },
      mainDACCategory: { langKey: 'main_dac_category', value: this.mainDACCategory },
      mainUNOCHACategory: { langKey: 'main_unocha_category', value: this.mainUNOCHACategory },
      subDACCategory: { langKey: 'sub_dac_category', value: this.subDACCategory },
      subUNOCHACategory: { langKey: 'sub_unocha_category', value: this.subUNOCHACategory },
      internalProjectClassification: { langKey: 'internal_projects_classification', value: this.internalProjectClassification },
    };
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
      internalProjectClassification,
    } = this;

    return {
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      oldLicenseFullSerial: controls ? [oldLicenseFullSerial, [CustomValidators.maxLength(250)]] : oldLicenseFullSerial,
      projectWorkArea: controls ? [projectWorkArea, [CustomValidators.required], []] : projectWorkArea,
      beneficiaryCountry: controls ? [beneficiaryCountry, [CustomValidators.required], []] : beneficiaryCountry,
      domain: controls ? [domain] : domain,
      mainDACCategory: controls ? [mainDACCategory] : mainDACCategory,
      mainUNOCHACategory: controls ? [mainUNOCHACategory] : mainUNOCHACategory,
      subDACCategory: controls ? [subDACCategory] : subDACCategory,
      subUNOCHACategory: controls ? [subUNOCHACategory] : subUNOCHACategory,
      internalProjectClassification: controls ? [internalProjectClassification] : internalProjectClassification,
    }
  }

  getBuildProjectInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      implementationTemplate: { langKey: 'templates', value: this.implementationTemplate },
      implementingAgencyType: { langKey: 'implementation_agency_type', value: this.implementingAgencyType },
      licenseStartDate: { langKey: 'license_start_date', value: this.licenseStartDate },
      projectEvaluationSLA: { langKey: 'project_evaluation_sla', value: this.projectEvaluationSLA },
      licenseDuration: { langKey: 'license_duration', value: this.licenseDuration },
      implementingAgencyList: { langKey: 'implementation_agency', value: this.implementingAgencyList },
      projectTotalCost: { langKey: 'target_amount', value: this.projectTotalCost },
    };
  }
  buildProjectInfo(controls: boolean = false) {
    const {
      implementationTemplate,
      implementingAgencyType,
      licenseStartDate,
      projectEvaluationSLA,
      licenseDuration,
      implementingAgencyList,
      projectTotalCost
    } = this
    return {
      licenseStartDate: controls ? [licenseStartDate, CustomValidators.required] : licenseStartDate,
      licenseDuration: controls ? [licenseDuration, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(3)]] : licenseDuration,
      projectEvaluationSLA: controls ? [projectEvaluationSLA, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(3)]] : projectEvaluationSLA,
      implementingAgencyType: controls ? [implementingAgencyType, CustomValidators.required] : implementingAgencyType,
      implementationTemplate: controls ? [implementationTemplate, CustomValidators.requiredArray] : implementationTemplate,
      implementingAgencyList: controls ? [implementingAgencyList, CustomValidators.requiredArray] : implementingAgencyList,
      projectTotalCost: controls ? [projectTotalCost, [CustomValidators.required, Validators.min(1)]] : projectTotalCost
    }
  }

  getBuildFundingResourcesValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      implementationFundraising: { langKey: 'menu_projects_fundraising', value: this.implementationFundraising },
      financialGrant: { langKey: 'grant_financial', value: this.financialGrant },
      selfFinancing: { langKey: 'self_financial', value: this.selfFinancing },
      payment: { langKey: 'payments', value: this.payment },
    };
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
      payment: controls ? [payment, CustomValidators.requiredArray] : payment,
    };
  }

  getAdminResultByProperty(property: keyof ProjectImplementation): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'beneficiaryCountry':
        adminResultValue = this.beneficiaryCountryInfo;
        break;
      case 'domain':
        adminResultValue = this.domainInfo;
        break;
      case 'mainUNOCHACategory':
        adminResultValue = this.mainUNOCHACategoryInfo;
        break;
      case 'subUNOCHACategory':
        adminResultValue = this.subUNOCHACategoryInfo;
        break;
      case 'mainDACCategory':
        adminResultValue = this.mainDACCategoryInfo;
        break;
      case 'projectWorkArea':
        adminResultValue = this.workAreaInfo;
        break;
      case 'subDACCategory':
        adminResultValue = this.subDACCategoryInfo;
        break;
      case 'internalProjectClassification':
        adminResultValue = this.internalProjectClassificationInfo;
        break;
      case 'implementingAgencyType':
        adminResultValue = this.implementingAgencyTypeInfo;
        break;
      case 'licenseStatus':
        adminResultValue = this.licenseStatusInfo;
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
  buildSpecialInfo(controls: boolean = false) {
    return {
      description: controls ? [this.description, [CustomValidators.required]] : this.description
    };
  }

  setProjectTotalCost(value: number): void {
    this.projectTotalCost = currency(value).value
  }

  beforeSend(): void {
    const templateInterceptor = new ImplementationTemplateInterceptor()
    const agencyInterceptor = new ImplementingAgencyInterceptor()
    const fundraisingInterceptor = new ImplementationFundraisingInterceptor()
    this.implementationTemplate = this.implementationTemplate.map((item: Partial<ImplementationTemplate>) => {
      return templateInterceptor.send(item.clone!()) as ImplementationTemplate
    })
    this.implementationFundraising = this.implementationFundraising.map((item: Partial<ImplementationFundraising>) => {
      return fundraisingInterceptor.send(item.clone!()) as ImplementationFundraising
    })
    this.implementingAgencyList = this.implementingAgencyList.map((item: Partial<ImplementingAgency>) => {
      return agencyInterceptor.send(item.clone!()) as ImplementingAgency
    })

    this.payment = this.payment.map(item => {
      item.dueDate = DateUtils.changeDateFromDatepicker(item.dueDate as unknown as IMyDateModel)?.toISOString()!
      return item
    })
    this.licenseStartDate = !this.licenseStartDate ? this.licenseStartDate : DateUtils.changeDateFromDatepicker(this.licenseStartDate as unknown as IMyDateModel)?.toISOString()!
  }

  approve(): DialogRef {
    if (this._isCustomApprove()) {
      return this.service.approveTask(this, WFResponseType.APPROVE);
    }
    return super.approve(WFResponseType.APPROVE)
  }

  finalApprove(): DialogRef {
    if (this._isCustomApprove()) {
      return this.service.approveTask(this, WFResponseType.FINAL_APPROVE);
    }
    return super.approve(WFResponseType.FINAL_APPROVE)
  }
  validateApprove(): DialogRef {
    if (this._isCustomApprove()) {
      return this.service.approveTask(this, WFResponseType.VALIDATE_APPROVE);
    }
    return super.approve(WFResponseType.VALIDATE_APPROVE)

  }
  isSubmissionMechanismNotification(): boolean {
    return this.submissionMechanism === SubmissionMechanisms.NOTIFICATION;
  }

  isSubmissionMechanismSubmission(): boolean {
    return this.submissionMechanism === SubmissionMechanisms.SUBMISSION;
  }

  isSubmissionMechanismRegistration(): boolean {
    return this.submissionMechanism === SubmissionMechanisms.REGISTRATION;
  }
  private _isCustomApprove(): boolean {

    if (this.isSubmissionMechanismRegistration()) {
      if (this.employeeService.isSupervisionAndControlUser() || this.employeeService.isDevelopmentalExpert() || this.employeeService.isConstructionExpert()) {
        return false;
      }
    }
    if (this.requestType === AllRequestTypesEnum.NEW || this.requestType === AllRequestTypesEnum.EXTEND) {
      if (this.isSubmissionMechanismNotification() && this.employeeService.isCharityManager()) {
        return true;
      }
      if (this.isSubmissionMechanismRegistration() || this.isSubmissionMechanismSubmission()) {
        return true;
      }
    }
    return false;
  }
}
