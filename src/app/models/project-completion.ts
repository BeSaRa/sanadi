import { IMyDateModel } from 'angular-mydatepicker';
import { AdminResult } from './admin-result';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { ControlValueLabelLangKey, ISearchFieldsMap } from './../types/types';
import { HasLicenseDurationType } from '@contracts/has-license-duration-type';
import { CaseTypes } from '@app/enums/case-types.enum';
import { mixinLicenseDurationType } from "@app/mixins/mixin-license-duration";
import { Validators } from "@angular/forms";
import { FactoryService } from "@services/factory.service";
import { InterceptModel } from "@decorators/intercept-model";
import { CaseModel } from "@app/models/case-model";
import { HasRequestType } from "@app/interfaces/has-request-type";
import { mixinRequestType } from "@app/mixins/mixin-request-type";
import { CaseModelContract } from "@contracts/case-model-contract";
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { ObjectUtils } from '@app/helpers/object-utils';
import { CommonUtils } from '@app/helpers/common-utils';
import { ProjectCompletionInterceptor } from '@app/model-interceptors/project-completion-interceptor';
import { ProjectCompletionService } from '@app/services/project-completion.service';
import { LessonsLearned } from './lessons-learned';
import { BestPractices } from './best-practices';
import { DomainTypes } from '@app/enums/domain-types';
import { DateUtils } from '@app/helpers/date-utils';
import { CustomValidators } from '@app/validators/custom-validators';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';

const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const interceptor = new ProjectCompletionInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class ProjectCompletion
  extends _RequestType<ProjectCompletionService, ProjectCompletion>
  implements HasRequestType, HasLicenseDurationType, CaseModelContract<ProjectCompletionService, ProjectCompletion>, IAuditModelProperties<ProjectCompletion> {
  service!: ProjectCompletionService;
  caseType: number = CaseTypes.PROJECT_COMPLETION;
  requestType!: number;
  projectLicenseId!: string;
  projectLicenseFullSerial!: string;
  projectLicenseSerial!: number;
  projectWorkArea!: number;
  domain!: number;
  mainDACCategory!: number;
  subDACCategory!: number;
  mainUNOCHACategory!: number;
  subUNOCHACategory!: number;
  internalProjectClassification!: number;
  beneficiaryCountry!: number;
  actualTotalCost!: number;
  beneficiaries0to5!: number;
  beneficiaries5to18!: number;
  beneficiaries19to60!: number;
  beneficiariesOver60!: number;
  directBeneficiaryNumber!: number;
  indirectBeneficiaryNumber!: number;
  customTerms!: string;
  publicTerms!: string;
  followUpDate!: string | IMyDateModel;
  conditionalLicenseIndicator!: boolean;
  projectEvaluationSLADate!: string | IMyDateModel;
  licenseEndDate!: string | IMyDateModel;
  actualEndDate!: string | IMyDateModel;

  notes!: string;
  bestPracticesList: BestPractices[] = [];
  lessonsLearnedList: LessonsLearned[] = [];
  templateCost!: number;
  description!: string;
  effort!: number;
  impact!: number;

  // For view only
  projectTotalCost!: number;
  projectDescription!: string;
  projectName!: string;

  domainInfo!: AdminResult;
  workAreaInfo!: AdminResult;
  mainDACCategoryInfo!: AdminResult;
  subDACCategoryInfo!: AdminResult;
  mainUNOCHACategoryInfo!: AdminResult;
  subUNOCHACategoryInfo!: AdminResult;
  internalProjectClassificationInfo!: AdminResult;
  beneficiaryCountryInfo!: AdminResult;

  actualEndDateTimestamp!: number | null;
  projectEvaluationSLADateTimestamp!: number | null;
  licenseEndDateTimestamp!: number | null;
  searchFields: ISearchFieldsMap<ProjectCompletion> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['caseStatusInfo', 'creatorInfo', 'ouInfo']),
    ...normalSearchFields(['fullSerial'])
  };

  constructor() {
    super();
    this.service = FactoryService.getService("ProjectCompletionService");
    this.finalizeSearchFields();
  }

  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getAdminResultByProperty(property: keyof ProjectCompletion): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'domain':
        adminResultValue = this.domainInfo;
        break;
      case 'projectWorkArea':
        adminResultValue = this.workAreaInfo;
        break;
      case 'mainDACCategory':
        adminResultValue = this.mainDACCategoryInfo;
        break;
      case 'subUNOCHACategory':
        adminResultValue = this.subUNOCHACategoryInfo;
        break;
      case 'mainUNOCHACategory':
        adminResultValue = this.mainUNOCHACategoryInfo;
        break;
      case 'subDACCategory':
        adminResultValue = this.subDACCategoryInfo;
        break;
      case 'internalProjectClassification':
        adminResultValue = this.internalProjectClassificationInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;
      case 'organizationId':
        adminResultValue = this.ouInfo;
        break;
      case 'beneficiaryCountry':
        adminResultValue = this.beneficiaryCountryInfo;
        break;
      case 'projectEvaluationSLADate':
        const projectEvaluationSLADate = DateUtils.getDateStringFromDate(this.projectEvaluationSLADate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: projectEvaluationSLADate, enName: projectEvaluationSLADate });
        break;
      case 'licenseEndDate':
        const licenseEndDate = DateUtils.getDateStringFromDate(this.licenseEndDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: licenseEndDate, enName: licenseEndDate });
        break;
      case 'actualEndDate':
        const actualEndDate = DateUtils.getDateStringFromDate(this.actualEndDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: actualEndDate, enName: actualEndDate });
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

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  getprojectLicenseInfoFormValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: { langKey: 'request_type', value: this.requestType },
      projectWorkArea: { langKey: 'project_work_area', value: this.projectWorkArea },
      domain: { langKey: 'domain', value: this.domain },
      beneficiaryCountry: { langKey: 'beneficiary_country', value: this.beneficiaryCountry },
      internalProjectClassification: { langKey: 'internal_projects_classification', value: this.internalProjectClassification },
      mainDACCategory: { langKey: 'main_dac_category', value: this.mainDACCategory },
      subDACCategory: { langKey: 'sub_dac_category', value: this.subDACCategory },
      mainUNOCHACategory: { langKey: 'main_unocha_category', value: this.mainUNOCHACategory },
      subUNOCHACategory: { langKey: 'sub_unocha_category', value: this.subUNOCHACategory },
    };
  }
  getProjectBasicInfoFormValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      actualEndDate: {
        langKey: 'the_date_of_the_end_of_the_actual_execution', value: this.actualEndDate,
        comparisonValue: this.actualEndDateTimestamp
      },
      projectEvaluationSLADate: {
        langKey: 'project_evaluation_sla_date', value: this.projectEvaluationSLADate,
        comparisonValue: this.projectEvaluationSLADateTimestamp
      },
      actualTotalCost: {
        langKey: 'actual_cost', value: this.actualTotalCost
      },
      notes: { langKey: 'notes', value: this.notes },
    }
  }

  getBeneficiaryAnalyticsByLicenseFormValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      directBeneficiaryNumber: { langKey: 'direct_beneficiary_count', value: this.directBeneficiaryNumber },
      indirectBeneficiaryNumber: { langKey: 'indirect_beneficiary_count', value: this.indirectBeneficiaryNumber },
      beneficiaries0to5: { langKey: 'number_of_0_to_5', value: this.beneficiaries0to5 },
      beneficiaries5to18: { langKey: 'number_of_5_to_18', value: this.beneficiaries5to18 },
      beneficiaries19to60: { langKey: 'number_of_19_to_60', value: this.beneficiaries19to60 },
      beneficiariesOver60: { langKey: 'number_of_above_60', value: this.beneficiariesOver60 }
    }
  }
  getEvaluationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      impact: { langKey: 'impact', value: this.impact },
      effort: { langKey: 'effort', value: this.effort },
    }
  }
  getSpecialExplanationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      description: { langKey: 'special_explanations', value: this.description },
    }
  }

  formBuilder(controls?: boolean) {
    const {
      requestType,
      projectWorkArea,
      beneficiaryCountry,
      domain,
      internalProjectClassification,
      mainDACCategory,
      subDACCategory,
      mainUNOCHACategory,
      subUNOCHACategory,
    } = ObjectUtils.getControlValues<ProjectCompletion>(this.getprojectLicenseInfoFormValuesWithLabels());
    const {
      actualEndDate,
      projectEvaluationSLADate,
      actualTotalCost,
      notes
    } = ObjectUtils.getControlValues<ProjectCompletion>(this.getProjectBasicInfoFormValuesWithLabels());
    const {
      directBeneficiaryNumber,
      indirectBeneficiaryNumber,
      beneficiaries0to5,
      beneficiaries5to18,
      beneficiaries19to60,
      beneficiariesOver60
    } = ObjectUtils.getControlValues<ProjectCompletion>(this.getBeneficiaryAnalyticsByLicenseFormValuesWithLabels());
    const { description } = ObjectUtils.getControlValues<ProjectCompletion>(this.getSpecialExplanationValuesWithLabels());
    const { impact, effort } = ObjectUtils.getControlValues<ProjectCompletion>(this.getEvaluationValuesWithLabels());

    return {
      projectLicenseInfo: {
        requestType: controls ? [requestType, CustomValidators.required] : requestType,
        projectWorkArea: controls ? [projectWorkArea, CustomValidators.required] : projectWorkArea,
        beneficiaryCountry: controls ? [beneficiaryCountry, CustomValidators.required] : beneficiaryCountry,
        domain: controls ? [domain] : domain,
        internalProjectClassification: controls ? [internalProjectClassification] : internalProjectClassification,
        mainDACCategory: controls ? [mainDACCategory] : mainDACCategory,
        subDACCategory: controls ? [subDACCategory] : subDACCategory,
        mainUNOCHACategory: controls ? [mainUNOCHACategory] : mainUNOCHACategory,
        subUNOCHACategory: controls ? [subUNOCHACategory] : subUNOCHACategory,
      },
      projectBasicInfo: {
        actualEndDate: controls ? [actualEndDate, CustomValidators.required] : actualEndDate,
        projectEvaluationSLADate: controls ? [projectEvaluationSLADate, CustomValidators.required] : projectEvaluationSLADate,
        actualTotalCost: controls ? [actualTotalCost, [CustomValidators.required, CustomValidators.decimal(2)]] : actualTotalCost,
        notes: controls ? [notes] : notes,
      },
      beneficiaryAnalyticsByLicense: {
        directBeneficiaryNumber: controls ? [directBeneficiaryNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : directBeneficiaryNumber,
        indirectBeneficiaryNumber: controls ? [indirectBeneficiaryNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : indirectBeneficiaryNumber,
        beneficiaries0to5: controls ? [beneficiaries0to5, [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]] : beneficiaries0to5,
        beneficiaries5to18: controls ? [beneficiaries5to18, [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]] : beneficiaries5to18,
        beneficiaries19to60: controls ? [beneficiaries19to60, [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]] : beneficiaries19to60,
        beneficiariesOver60: controls ? [beneficiariesOver60, [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]] : beneficiariesOver60
      },
      evaluation: {
        impact: controls ? [impact, [CustomValidators.required]] : impact,
        effort: controls ? [effort, [CustomValidators.required]] : effort
      },
      explanation: {
        description: controls ? [description, CustomValidators.required] : description,
      }
    };
  }

  getDacOchaId(): number | null {
    return this.domain === DomainTypes.DEVELOPMENT ? this.mainDACCategory :
      this.mainUNOCHACategory
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      followUpDate: { langKey: 'follow_up_date', value: this.followUpDate },
      conditionalLicenseIndicator: { langKey: 'conditional_license_indicator', value: this.conditionalLicenseIndicator },
      publicTerms: { langKey: 'public_terms', value: this.publicTerms },
      customTerms: { langKey: 'custom_terms', value: this.customTerms },
    };
  }
  buildApprovalForm(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<ProjectCompletion>(this.getValuesWithLabels());
    return {
      followUpDate: controls ? [DateUtils.changeDateToDatepicker(values.followUpDate)] : DateUtils.changeDateToDatepicker(values.followUpDate),
      conditionalLicenseIndicator: controls ? [values.conditionalLicenseIndicator] : values.conditionalLicenseIndicator,
      publicTerms: controls ? [values.publicTerms] : values.publicTerms,
      customTerms: controls ? [values.customTerms] : values.customTerms
    }
  }
  validateApprove(): DialogRef {
    return this.service.approve(this, WFResponseType.VALIDATE_APPROVE)
  }

  approve(): DialogRef {
    return this.service.approve(this, WFResponseType.APPROVE)
  }

  finalApprove(): DialogRef {
    return this.service.approve(this, WFResponseType.FINAL_APPROVE)
  }
}
