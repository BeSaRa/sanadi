import {CaseModel} from "@app/models/case-model";
import {ProjectModelService} from "@app/services/project-model.service";
import {AdminResult} from "@app/models/admin-result";
import {ProjectComponent} from "@app/models/project-component";
import {FactoryService} from "@app/services/factory.service";
import {CustomValidators} from "@app/validators/custom-validators";
import {CommonUtils} from "@app/helpers/common-utils";
import {Validators} from '@angular/forms';
import {ISearchFieldsMap} from "@app/types/types";
import {dateSearchFields} from "@app/helpers/date-search-fields";
import {infoSearchFields} from "@app/helpers/info-search-fields";
import {normalSearchFields} from "@app/helpers/normal-search-fields";
import {CaseTypes} from '@app/enums/case-types.enum';
import {ProjectModelInterceptor} from '@app/model-interceptors/project-model-interceptor';
import {InterceptModel} from '@decorators/intercept-model';

// noinspection JSUnusedGlobalSymbols
const {send, receive} = new ProjectModelInterceptor();
@InterceptModel({send, receive})
export class ProjectModel extends CaseModel<ProjectModelService, ProjectModel> {
  caseType: number = CaseTypes.EXTERNAL_PROJECT_MODELS;
  organizationId!: number;
  requestType!: number;
  projectType!: number;
  templateType!: number;
  projectName!: string;
  projectDescription!: string;
  beneficiaryCountry!: number;
  beneficiaryRegion!: string;
  executionCountry!: number;
  executionRegion!: string;
  implementingAgencyType!: number;
  implementationPeriod!: number;
  domain!: number;
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
  exitMechanism!: string;
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
  description!: string;
  year!: number;
  needsAssessment!: string;
  templateSerial!: number;
  templateFullSerial!: string;
  templateId!: string;
  templateStatus!: number;
  componentList!: ProjectComponent[];
  requestTypeInfo!: AdminResult;
  projectTypeInfo!: AdminResult;
  templateTypeInfo!: AdminResult;
  templateStatusInfo!: AdminResult;
  beneficiaryCountryInfo!: AdminResult;
  executionCountryInfo!: AdminResult;
  implementingAgencyTypeInfo!: AdminResult;
  domainInfo!: AdminResult;
  mainUNOCHACategoryInfo!: AdminResult;
  subUNOCHACategoryInfo!: AdminResult;
  mainDACCategoryInfo!: AdminResult;
  subDACCategoryInfo!: AdminResult;
  firstSDGoalInfo!: AdminResult;
  secondSDGoalInfo!: AdminResult;
  thirdSDGoalInfo!: AdminResult;
  service!: ProjectModelService;

  searchFields: ISearchFieldsMap<ProjectModel> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['requestTypeInfo', 'creatorInfo', 'caseStatusInfo', 'projectTypeInfo', 'requestTypeInfo', 'templateTypeInfo']),
    ...normalSearchFields(['projectName', 'fullSerial'])
  }

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

  buildBasicInfoTab(controls: boolean = false): any {
    const {
      projectType,
      requestType,
      projectName,
      projectDescription,
      beneficiaryCountry,
      beneficiaryRegion,
      executionCountry,
      executionRegion,
      implementingAgencyType,
      year,
      implementationPeriod,
      templateType
    } = this;
    return {
      requestType: controls ? [requestType, CustomValidators.required] : requestType,
      templateType: controls ? [templateType, CustomValidators.required] : templateType,
      projectType: controls ? [projectType, CustomValidators.required] : projectType,
      projectName: controls ? [projectName,
        [
          CustomValidators.required,
          CustomValidators.minLength(4),
          CustomValidators.maxLength(100),
          CustomValidators.pattern('ENG_AR_ONLY')
        ]
      ] : projectName,
      projectDescription: controls ? [projectDescription, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]
      ] : projectDescription,
      beneficiaryCountry: controls ? [beneficiaryCountry, CustomValidators.required] : beneficiaryCountry,
      beneficiaryRegion: controls ? [beneficiaryRegion, [CustomValidators.required, CustomValidators.maxLength(250)]] : beneficiaryRegion,
      executionCountry: controls ? [executionCountry, CustomValidators.required] : executionCountry,
      executionRegion: controls ? [executionRegion, [CustomValidators.required, CustomValidators.maxLength(250)]] : executionRegion,
      implementingAgencyType: controls ? [implementingAgencyType, CustomValidators.required] : implementingAgencyType,
      year: controls ? [year, [CustomValidators.required, CustomValidators.maxLength(4)]] : year,
      implementationPeriod: controls ? [implementationPeriod, [CustomValidators.required, CustomValidators.maxLength(4)]] : implementationPeriod
    }
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
      thirdSDGoal
    } = this;
    return {
      domain: controls ? [domain, CustomValidators.required] : domain,
      mainDACCategory: controls ? [mainDACCategory] : mainDACCategory,
      subDACCategory: controls ? [subDACCategory] : subDACCategory,
      mainUNOCHACategory: controls ? [mainUNOCHACategory] : mainUNOCHACategory,
      subUNOCHACategory: controls ? [subUNOCHACategory] : subUNOCHACategory,
      firstSDGoal: controls ? [firstSDGoal] : firstSDGoal,
      secondSDGoal: controls ? [secondSDGoal] : secondSDGoal,
      thirdSDGoal: controls ? [thirdSDGoal] : thirdSDGoal
    }
  }

  buildCategoryGoalPercentGroup(controls: boolean = false): any {
    const {
      firstSDGoalPercentage,
      secondSDGoalPercentage,
      thirdSDGoalPercentage
    } = this;
    return {
      firstSDGoalPercentage: controls ? [firstSDGoalPercentage, [CustomValidators.decimal(2), Validators.max(100)]] : firstSDGoalPercentage,
      secondSDGoalPercentage: controls ? [secondSDGoalPercentage, [CustomValidators.decimal(2), Validators.max(100)]] : secondSDGoalPercentage,
      thirdSDGoalPercentage: controls ? [thirdSDGoalPercentage, [CustomValidators.decimal(2), Validators.max(100)]] : thirdSDGoalPercentage
    }
  }

  buildSummaryTab(controls: boolean = false): any {
    const {
      needsAssessment,
      goals,
      directBeneficiaryNumber,
      indirectBeneficiaryNumber,
      beneficiaryFamiliesNumber,
      successItems,
      outputs,
      expectedImpact,
      expectedResults,
      sustainabilityItems,
      exitMechanism
    } = this;
    return {
      needsAssessment: controls ? [needsAssessment, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : needsAssessment,
      goals: controls ? [goals, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : goals,
      directBeneficiaryNumber: controls ? [directBeneficiaryNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : directBeneficiaryNumber,
      indirectBeneficiaryNumber: controls ? [indirectBeneficiaryNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : indirectBeneficiaryNumber,
      beneficiaryFamiliesNumber: controls ? [beneficiaryFamiliesNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : beneficiaryFamiliesNumber,
      successItems: controls ? [successItems, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : successItems,
      outputs: controls ? [outputs, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : outputs,
      expectedImpact: controls ? [expectedImpact, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : expectedImpact,
      expectedResults: controls ? [expectedResults, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : expectedResults,
      sustainabilityItems: controls ? [sustainabilityItems, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : sustainabilityItems,
      exitMechanism: controls ? [exitMechanism, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : exitMechanism
    }
  }

  buildSummaryPercentGroup(controls: boolean = false): any {
    const {
      beneficiaries0to5,
      beneficiaries5to18,
      beneficiaries19to60,
      beneficiariesOver60
    } = this;
    return {
      beneficiaries0to5: controls ? [beneficiaries0to5, [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]] : beneficiaries0to5,
      beneficiaries5to18: controls ? [beneficiaries5to18, [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]] : beneficiaries5to18,
      beneficiaries19to60: controls ? [beneficiaries19to60, [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]] : beneficiaries19to60,
      beneficiariesOver60: controls ? [beneficiariesOver60, [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]] : beneficiariesOver60
    }
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
}
