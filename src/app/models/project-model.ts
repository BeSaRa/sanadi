import {CaseModel} from "@app/models/case-model";
import {ProjectModelService} from "@app/services/project-model.service";
import {AdminResult} from "@app/models/admin-result";
import {ProjectComponent} from "@app/models/project-component";
import {FactoryService} from "@app/services/factory.service";
import {CustomValidators} from "@app/validators/custom-validators";
import {CommonUtils} from "@app/helpers/common-utils";
import {Validators} from '@angular/forms';

// noinspection JSUnusedGlobalSymbols
export class ProjectModel extends CaseModel<ProjectModelService, ProjectModel> {
  caseType: number = 9;
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
  expectedResults!: string;
  expectedImpact!: string;
  directMaleBeneficiaries: number = 0;
  directFemaleBeneficiaries: number = 0;
  indirectMaleBeneficiaries: number = 0;
  indirectFemaleBeneficiaries: number = 0;
  beneficiaries0to5: number = 0;
  beneficiaries5to18: number = 0;
  beneficiaries19to60: number = 0;
  beneficiariesOver60: number = 0;
  projectTotalCost!: number;
  description!: string;
  year!: number;
  needsAssessment!: string;
  handicappedBeneficiaryNumber: number = 0;
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

  constructor() {
    super();
    this.service = FactoryService.getService('ProjectModelService')
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
        CustomValidators.maxLength(1200)]
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
      directFemaleBeneficiaries,
      directMaleBeneficiaries,
      indirectFemaleBeneficiaries,
      indirectMaleBeneficiaries,
      handicappedBeneficiaryNumber,
      successItems,
      outputs,
      expectedImpact,
      expectedResults,
      sustainabilityItems
    } = this;
    return {
      needsAssessment: controls ? [needsAssessment, [CustomValidators.required, CustomValidators.maxLength(1200)]] : needsAssessment,
      goals: controls ? [goals, [CustomValidators.required, CustomValidators.maxLength(1200)]] : goals,
      handicappedBeneficiaryNumber: controls ? [handicappedBeneficiaryNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : handicappedBeneficiaryNumber,
      directFemaleBeneficiaries: controls ? [directFemaleBeneficiaries, [CustomValidators.required,CustomValidators.maxLength(20)]] : directFemaleBeneficiaries,
      directMaleBeneficiaries: controls ? [directMaleBeneficiaries, [CustomValidators.required, CustomValidators.maxLength(20)]] : directMaleBeneficiaries,
      indirectFemaleBeneficiaries: controls ? [indirectFemaleBeneficiaries, [CustomValidators.required, CustomValidators.maxLength(20)]] : indirectFemaleBeneficiaries,
      indirectMaleBeneficiaries: controls ? [indirectMaleBeneficiaries, [CustomValidators.required, CustomValidators.maxLength(20)]] : indirectMaleBeneficiaries,
      successItems: controls ? [successItems, [CustomValidators.required, CustomValidators.maxLength(1200)]] : successItems,
      outputs: controls ? [outputs, [CustomValidators.required, CustomValidators.maxLength(1200)]] : outputs,
      expectedImpact: controls ? [expectedImpact, [CustomValidators.required, CustomValidators.maxLength(1200)]] : expectedImpact,
      expectedResults: controls ? [expectedResults, [CustomValidators.required, CustomValidators.maxLength(1200)]] : expectedResults,
      sustainabilityItems: controls ? [sustainabilityItems, [CustomValidators.maxLength(1200)]] : sustainabilityItems
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
