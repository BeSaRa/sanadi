import { CaseModel } from '@app/models/case-model';
import { ProjectModelService } from '@app/services/project-model.service';
import { AdminResult } from '@app/models/admin-result';
import { ProjectComponent } from '@app/models/project-component';
import { FactoryService } from '@app/services/factory.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { CommonUtils } from '@app/helpers/common-utils';
import { Validators } from '@angular/forms';
import { ControlValueLabelLangKey, ISearchFieldsMap } from '@app/types/types';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { CaseTypes } from '@app/enums/case-types.enum';
import { ProjectModelInterceptor } from '@app/model-interceptors/project-model-interceptor';
import { InterceptModel } from '@decorators/intercept-model';
import { EvaluationIndicator } from '@app/models/evaluation-indicator';
import { ProjectModelForeignCountriesProject } from '@app/models/project-model-foreign-countries-project';
import { ProjectAddress } from '@app/models/project-address';
import { EmployeeService } from '@services/employee.service';
import { ProjectTemplate } from "@app/models/projectTemplate";
import { ImplementationTemplate } from "@models/implementation-template"; import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { ObjectUtils } from '@app/helpers/object-utils';

const { send, receive } = new ProjectModelInterceptor();

@InterceptModel({ send, receive })
export class ProjectModel extends CaseModel<ProjectModelService, ProjectModel> implements IAuditModelProperties<ProjectModel> {
  caseType: number = CaseTypes.EXTERNAL_PROJECT_MODELS;
  organizationId!: number;
  requestType!: number;
  isConstructional: boolean = false;
  projectType!: number;
  projectName!: string;
  projectDescription!: string;
  beneficiaryCountry!: number;
  beneficiaryRegion!: string;
  executionCountry!: number;
  executionRegion!: string;
  projectWorkArea!: string;
  domain!: number;
  internalProjectClassification!: number;
  sanadiDomain!: number;
  sanadiMainClassification!: number;
  mainUNOCHACategory!: number;
  subUNOCHACategory!: number;
  mainDACCategory!: number;
  subDACCategory!: number;
  firstSDGoal!: number;
  secondSDGoal!: number;
  thirdSDGoal!: number;
  firstSDGoalPercentage: number = 0;
  secondSDGoalPercentage: number = 0;
  thirdSDGoalPercentage: number = 0;
  goals!: string;
  outputs!: string;
  successItems!: string;
  sustainabilityItems!: string;
  exitMechanism!: number;
  expectedResults!: string;
  expectedImpact!: string;
  directBeneficiaryNumber: number = 0;
  indirectBeneficiaryNumber: number = 0;
  beneficiaryFamiliesNumber: number = 0;
  beneficiaries0to5: number = 0;
  beneficiaries5to18: number = 0;
  beneficiaries19to60: number = 0;
  beneficiariesOver60: number = 0;
  projectTotalCost!: number;
  requestCaseId!: string;
  description!: string;
  needsAssessment!: string;
  templateSerial!: number;
  templateFullSerial!: string;
  templateId!: string;
  templateStatus!: number;
  interventionType!: number;
  subInternalProjectClassification: string[] = [];
  evaluationIndicatorList: EvaluationIndicator[] = [];
  foreignCountriesProjectList: ProjectModelForeignCountriesProject[] = [];
  projectAddressList: ProjectAddress[] = [];
  componentList!: ProjectComponent[];
  requestTypeInfo!: AdminResult;
  projectTypeInfo!: AdminResult;
  templateStatusInfo!: AdminResult;
  beneficiaryCountryInfo!: AdminResult;
  executionCountryInfo!: AdminResult;
  projectWorkAreaInfo!: AdminResult;
  domainInfo!: AdminResult;
  internalProjectClassificationInfo!: AdminResult;
  sanadiDomainInfo!: AdminResult;
  sanadiMainClassificationInfo!: AdminResult;
  mainUNOCHACategoryInfo!: AdminResult;
  subUNOCHACategoryInfo!: AdminResult;
  mainDACCategoryInfo!: AdminResult;
  subDACCategoryInfo!: AdminResult;
  firstSDGoalInfo!: AdminResult;
  secondSDGoalInfo!: AdminResult;
  thirdSDGoalInfo!: AdminResult;
  exitMechanismInfo!: AdminResult;
  interventionTypeInfo!: AdminResult;
  service!: ProjectModelService;
  targetAmount?: number
  beneficiaryPercentageInHostCommunity: number = 0;

  searchFields: ISearchFieldsMap<ProjectModel> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['requestTypeInfo', 'creatorInfo', 'caseStatusInfo', 'projectTypeInfo', 'requestTypeInfo']),
    ...normalSearchFields(['projectName', 'fullSerial'])
  };

  constructor() {
    super();
    this.service = FactoryService.getService('ProjectModelService');
    this.finalizeSearchFields();
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }
  getAdminResultByProperty(property: keyof ProjectModel): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'projectType':
        adminResultValue = this.projectTypeInfo;
        break;
      case 'projectWorkArea':
        adminResultValue = this.projectWorkAreaInfo;
        break;
      case 'executionCountry':
        adminResultValue = this.executionCountryInfo;
        break;
      case 'beneficiaryCountry':
        adminResultValue = this.beneficiaryCountryInfo;
        break;
      case 'domain':
        adminResultValue = this.domainInfo;
        break;
      case 'mainDACCategory':
        adminResultValue = this.mainDACCategoryInfo;
        break;
      case 'subDACCategory':
        adminResultValue = this.subDACCategoryInfo;
        break;
      case 'mainUNOCHACategory':
        adminResultValue = this.mainDACCategoryInfo;
        break;
      case 'subUNOCHACategory':
        adminResultValue = this.subUNOCHACategoryInfo;
        break;
      case 'internalProjectClassification':
        adminResultValue = this.internalProjectClassificationInfo;
        break;
      case 'firstSDGoal':
        adminResultValue = this.firstSDGoalInfo;
        break;
      case 'secondSDGoal':
        adminResultValue = this.secondSDGoalInfo;
        break;
      case 'thirdSDGoal':
        adminResultValue = this.thirdSDGoalInfo;
        break;
      case 'exitMechanism':
        adminResultValue = this.exitMechanismInfo;
        break;
      case 'sanadiDomain':
        adminResultValue = this.sanadiDomainInfo;
        break;
      case 'sanadiMainClassification':
        adminResultValue = this.sanadiMainClassificationInfo;
        break;
      case 'interventionType':
        adminResultValue = this.interventionTypeInfo;
        break;
      case 'subInternalProjectClassification':
        adminResultValue = AdminResult.createInstance({
          arName: this.subInternalProjectClassification.join(', '),
          enName: this.subInternalProjectClassification.join(', '),
        });
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
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      projectType: { langKey: 'project_type', value: this.projectType },
      requestType: { langKey: 'request_type', value: this.requestType },
      isConstructional: { langKey: 'constructional', value: this.isConstructional },
      projectName: { langKey: 'project_name', value: this.projectName },
      projectDescription: { langKey: 'project_description', value: this.projectDescription },
      projectWorkArea: { langKey: 'execution_field', value: this.projectWorkArea },
      beneficiaryCountry: { langKey: 'beneficiary_country_info', value: this.beneficiaryCountry },
      beneficiaryRegion: { langKey: 'region', value: this.beneficiaryRegion },
      executionCountry: { langKey: 'country', value: this.executionCountry },
      executionRegion: { langKey: 'region', value: this.executionRegion },
      interventionType: { langKey: 'intervention_type', value: this.interventionType },

    };
  }
  getExplanationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      description: { langKey: 'special_explanations', value: this.description },
    }
  }
  buildBasicInfoTab(controls: boolean = false): any {
    const {
      projectType,
      requestType,
      isConstructional,
      projectName,
      projectDescription,
      projectWorkArea,
      beneficiaryCountry,
      beneficiaryRegion,
      executionCountry,
      executionRegion,
      interventionType,
    } = ObjectUtils.getControlValues<ProjectModel>(this.getBasicInfoValuesWithLabels());
    return {
      requestType: controls ? [requestType, CustomValidators.required] : requestType,
      isConstructional: controls ? [isConstructional] : isConstructional,
      projectType: controls ? [projectType, CustomValidators.required] : projectType,
      projectName: controls ? [projectName,
        [
          CustomValidators.required,
          CustomValidators.minLength(4),
          CustomValidators.maxLength(100),
        ]
      ] : projectName,
      projectDescription: controls ? [projectDescription, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]
      ] : projectDescription,
      projectWorkArea: controls ? [projectWorkArea, CustomValidators.required] : projectWorkArea,
      beneficiaryCountry: controls ? [beneficiaryCountry, CustomValidators.required] : beneficiaryCountry,
      beneficiaryRegion: controls ? [beneficiaryRegion, [CustomValidators.required, CustomValidators.maxLength(250)]] : beneficiaryRegion,
      executionCountry: controls ? [executionCountry, CustomValidators.required] : executionCountry,
      executionRegion: controls ? [executionRegion, [CustomValidators.required, CustomValidators.maxLength(250)]] : executionRegion,
      interventionType: controls ? [interventionType, []] : interventionType,

    };
  }

  getCategoryValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      domain: { langKey: 'the_domain', value: this.domain },
      mainDACCategory: { langKey: 'main_dac_category', value: this.mainDACCategory },
      subDACCategory: { langKey: 'sub_dac_category', value: this.subDACCategory },
      mainUNOCHACategory: { langKey: 'main_unocha_category', value: this.mainUNOCHACategory },
      subUNOCHACategory: { langKey: 'sub_unocha_category', value: this.subUNOCHACategory },
      firstSDGoal: { langKey: 'first_sd_goal', value: this.firstSDGoal },
      secondSDGoal: { langKey: 'second_sd_goal', value: this.secondSDGoal },
      thirdSDGoal: { langKey: 'third_sd_goal', value: this.thirdSDGoal },
      internalProjectClassification: { langKey: 'internal_project_classification', value: this.internalProjectClassification },
      sanadiDomain: { langKey: 'sanadi_classification', value: this.sanadiDomain },
      sanadiMainClassification: { langKey: 'sanadi_main_classification', value: this.sanadiMainClassification },
      subInternalProjectClassification: {
        langKey: 'sub_classification',
        value: this.subInternalProjectClassification,
        comparisonValue: this.subInternalProjectClassification.join(', ')
      },
    };
  }
  buildCategoryTab(controls: boolean = false): any {
    const {
      domain,
      mainDACCategory,
      subDACCategory,
      mainUNOCHACategory,
      subUNOCHACategory,
      firstSDGoal,
      secondSDGoal,
      thirdSDGoal,
      internalProjectClassification,
      sanadiDomain,
      sanadiMainClassification,
      subInternalProjectClassification
    } = ObjectUtils.getControlValues<ProjectModel>(this.getCategoryValuesWithLabels());
    return {
      domain: controls ? [domain, CustomValidators.required] : domain,
      mainDACCategory: controls ? [mainDACCategory] : mainDACCategory,
      subDACCategory: controls ? [subDACCategory] : subDACCategory,
      mainUNOCHACategory: controls ? [mainUNOCHACategory] : mainUNOCHACategory,
      subUNOCHACategory: controls ? [subUNOCHACategory] : subUNOCHACategory,
      firstSDGoal: controls ? [firstSDGoal] : firstSDGoal,
      secondSDGoal: controls ? [secondSDGoal] : secondSDGoal,
      thirdSDGoal: controls ? [thirdSDGoal] : thirdSDGoal,
      internalProjectClassification: controls ? [internalProjectClassification] : internalProjectClassification,
      sanadiDomain: controls ? [sanadiDomain] : sanadiDomain,
      sanadiMainClassification: controls ? [sanadiMainClassification] : sanadiMainClassification,
      subInternalProjectClassification: controls ? [subInternalProjectClassification,[]] : subInternalProjectClassification,

    };
  }
  getCategoryGoalPercentValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      firstSDGoalPercentage: { langKey: 'first_sd_goal_percentage', value: this.firstSDGoalPercentage },
      secondSDGoalPercentage: { langKey: 'second_sd_goal_percentage', value: this.secondSDGoalPercentage },
      thirdSDGoalPercentage: { langKey: 'third_sd_goal_percentage', value: this.thirdSDGoalPercentage }
    };
  }
  buildCategoryGoalPercentGroup(controls: boolean = false): any {
    const {
      firstSDGoalPercentage,
      secondSDGoalPercentage,
      thirdSDGoalPercentage
    } = ObjectUtils.getControlValues<ProjectModel>(this.getCategoryGoalPercentValuesWithLabels());
    return {
      firstSDGoalPercentage: controls ? [firstSDGoalPercentage, [CustomValidators.decimal(2), Validators.max(100)]] : firstSDGoalPercentage,
      secondSDGoalPercentage: controls ? [secondSDGoalPercentage, [CustomValidators.decimal(2), Validators.max(100)]] : secondSDGoalPercentage,
      thirdSDGoalPercentage: controls ? [thirdSDGoalPercentage, [CustomValidators.decimal(2), Validators.max(100)]] : thirdSDGoalPercentage
    };
  }

  getSummaryValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      needsAssessment: { langKey: 'project_needs_assessment', value: this.needsAssessment },
      goals: { langKey: 'project_goals', value: this.goals },
      directBeneficiaryNumber: { langKey: 'direct_beneficiary_count', value: this.directBeneficiaryNumber },
      indirectBeneficiaryNumber: { langKey: 'indirect_beneficiary_count', value: this.indirectBeneficiaryNumber },
      beneficiaryFamiliesNumber: { langKey: 'beneficiary_families_count', value: this.beneficiaryFamiliesNumber },
      successItems: { langKey: 'project_success_items', value: this.successItems },
      outputs: { langKey: 'project_outputs', value: this.outputs },
      expectedImpact: { langKey: 'project_expected_impacts', value: this.expectedImpact },
      expectedResults: { langKey: 'project_expected_results', value: this.expectedResults },
      sustainabilityItems: { langKey: 'project_sustainability_items', value: this.sustainabilityItems },
      exitMechanism: { langKey: 'exit_mechanism', value: this.exitMechanism },
      beneficiaryPercentageInHostCommunity: { langKey: 'beneficiary_percent_in_host_community', value: this.beneficiaryPercentageInHostCommunity }
    };
  }
  buildSummaryTab(controls: boolean = false): any {
    const employeeService: EmployeeService = FactoryService.getService('EmployeeService');
    const profile = {
      isCharityProfile: employeeService.isCharityProfile(),
      isInstitutionProfile: employeeService.isInstitutionProfile()
    }

    const values = ObjectUtils.getControlValues<ProjectModel>(this.getSummaryValuesWithLabels());

    if (profile.isCharityProfile || profile.isInstitutionProfile) {
      return {
        needsAssessment: controls ? [values.needsAssessment, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.needsAssessment,
        goals: controls ? [values.goals, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.goals,
        directBeneficiaryNumber: controls ? [values.directBeneficiaryNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : values.directBeneficiaryNumber,
        indirectBeneficiaryNumber: controls ? [values.indirectBeneficiaryNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : values.indirectBeneficiaryNumber,
        beneficiaryFamiliesNumber: controls ? [values.beneficiaryFamiliesNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : values.beneficiaryFamiliesNumber,
        successItems: controls ? [values.successItems, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.successItems,
        outputs: controls ? [values.outputs, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.outputs,
        expectedImpact: controls ? [values.expectedImpact, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.expectedImpact,
        expectedResults: controls ? [values.expectedResults, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.expectedResults,
        sustainabilityItems: controls ? [values.sustainabilityItems, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.sustainabilityItems,
        exitMechanism: controls ? [values.exitMechanism, [CustomValidators.required]] : values.exitMechanism,
        beneficiaryPercentageInHostCommunity: controls ? [values.beneficiaryPercentageInHostCommunity, [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]] : values.beneficiaryPercentageInHostCommunity,
      };
    } else {
      return {
        needsAssessment: controls ? [values.needsAssessment, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.needsAssessment,
        goals: controls ? [values.goals, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.goals,
        directBeneficiaryNumber: controls ? [values.directBeneficiaryNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : values.directBeneficiaryNumber,
        indirectBeneficiaryNumber: controls ? [values.indirectBeneficiaryNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : values.indirectBeneficiaryNumber,
        beneficiaryFamiliesNumber: controls ? [values.beneficiaryFamiliesNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : values.beneficiaryFamiliesNumber,
        successItems: controls ? [values.successItems, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.successItems,
        outputs: controls ? [values.outputs, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.outputs,
        expectedImpact: controls ? [values.expectedImpact, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.expectedImpact,
        expectedResults: controls ? [values.expectedResults, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.expectedResults,
        sustainabilityItems: controls ? [values.sustainabilityItems, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.sustainabilityItems,
        exitMechanism: controls ? [values.exitMechanism] : values.exitMechanism,
        beneficiaryPercentageInHostCommunity: controls ? [values.beneficiaryPercentageInHostCommunity, [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]] : values.beneficiaryPercentageInHostCommunity,
      };
    }
  }

  getSummaryPercentValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      beneficiaries0to5: { langKey: 'number_of_0_to_5', value: this.beneficiaries0to5 },
      beneficiaries5to18: { langKey: 'number_of_5_to_18', value: this.beneficiaries5to18 },
      beneficiaries19to60: { langKey: 'number_of_19_to_60', value: this.beneficiaries19to60 },
      beneficiariesOver60: { langKey: 'number_of_above_60', value: this.beneficiariesOver60 }
    }
  }
  buildSummaryPercentGroup(controls: boolean = false): any {
    const {
      beneficiaries0to5,
      beneficiaries5to18,
      beneficiaries19to60,
      beneficiariesOver60
    } = ObjectUtils.getControlValues<ProjectModel>(this.getSummaryPercentValuesWithLabels());
    return {
      beneficiaries0to5: controls ? [beneficiaries0to5, [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]] : beneficiaries0to5,
      beneficiaries5to18: controls ? [beneficiaries5to18, [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]] : beneficiaries5to18,
      beneficiaries19to60: controls ? [beneficiaries19to60, [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]] : beneficiaries19to60,
      beneficiariesOver60: controls ? [beneficiariesOver60, [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]] : beneficiariesOver60
    };
  }

  getTotalProjectComponentCost(numberOfDecimalPlaces: number = 2): number {
    if (!CommonUtils.isValidValue(this.componentList)) {
      return 0;
    }
    let total = this.componentList.filter(x => CommonUtils.isValidValue(x.totalCost))
      .map(t => t.totalCost)
      .reduce((a, b) => Number(Number(a).toFixed(numberOfDecimalPlaces)) + Number(Number(b).toFixed(numberOfDecimalPlaces)), 0) || 0;
    return Number(total.toFixed(numberOfDecimalPlaces));
  }

  normalizeTemplate(): ProjectTemplate {
    return (new ProjectTemplate()).clone({
      templateId: this.id,
      projectName: this.projectName,
      templateFullSerial: this.templateFullSerial,
      templateCost: this.projectTotalCost,
      publicStatus: this.templateStatus,
      publicStatusInfo: this.templateStatusInfo
    })
  }

  convertToImplementationTemplate(): ImplementationTemplate {
    return (new ImplementationTemplate()).clone({
      templateId: this.id,
      templateName: this.projectName,
      templateCost: this.projectTotalCost,
      projectTotalCost: this.targetAmount ? this.targetAmount : this.projectTotalCost,
      executionCountry: this.executionCountry,
      executionCountryInfo: this.executionCountryInfo,
      beneficiaryRegion: this.beneficiaryRegion,
      region: this.executionRegion,
      requestCaseId: this.requestCaseId,
      targetAmount: this.targetAmount ? this.targetAmount : this.projectTotalCost,
      beneficiaryCountry:this.beneficiaryCountry,
      beneficiaryCountryInfo:this.beneficiaryCountryInfo,
    })
  }
}
