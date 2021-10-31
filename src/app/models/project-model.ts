import {CaseModel} from "@app/models/case-model";
import {ProjectModelService} from "@app/services/project-model.service";
import {AdminResult} from "@app/models/admin-result";
import {ProjectComponent} from "@app/models/project-component";
import {FactoryService} from "@app/services/factory.service";
import {CustomValidators} from "@app/validators/custom-validators";

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
  firstSDGoalPercentage!: number;
  secondSDGoalPercentage!: number;
  thirdSDGoalPercentage!: number;
  goal!: string;
  outputs!: string;
  successItems!: string;
  sustainabilityItems!: string;
  expectedResults!: string;
  expectedImpact!: string;
  directMaleBeneficiaries!: number;
  directFemaleBeneficiaries!: number;
  indirectMaleBeneficiaries!: number;
  indirectFemaleBeneficiaries!: number;
  beneficiaries0to5!: number;
  beneficiaries5to18!: number;
  beneficiaries19to60!: number;
  beneficiariesOver60!: number;
  projectTotalCost!: number;
  description!: string;
  year!: number;
  needsAssessment!: string;
  handicappedBeneficiaryNumber!: number;
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
      beneficiaryRegion: controls ? [beneficiaryRegion, CustomValidators.required] : beneficiaryRegion,
      executionCountry: controls ? [executionCountry, CustomValidators.required] : executionCountry,
      executionRegion: controls ? [executionRegion, CustomValidators.required] : executionRegion,
      implementingAgencyType: controls ? [implementingAgencyType, CustomValidators.required] : implementingAgencyType,
      year: controls ? [year, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(4)]] : year,
      implementationPeriod: controls ? [implementationPeriod, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(4)]] : implementationPeriod
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
      thirdSDGoal,
      firstSDGoalPercentage,
      secondSDGoalPercentage,
      thirdSDGoalPercentage
    } = this;
    return {
      domain: controls ? [domain, CustomValidators.required] : domain,
      mainDACCategory: controls ? [mainDACCategory] : mainDACCategory,
      subDACCategory: controls ? [subDACCategory] : subDACCategory,
      mainUNOCHACategory: controls ? [mainUNOCHACategory] : mainUNOCHACategory,
      subUNOCHACategory: controls ? [subUNOCHACategory] : subUNOCHACategory,
      firstSDGoal: controls ? [firstSDGoal, CustomValidators.required] : firstSDGoal,
      firstSDGoalPercentage: controls ? [firstSDGoalPercentage, CustomValidators.required] : firstSDGoalPercentage,
      secondSDGoal: controls ? [secondSDGoal, CustomValidators.required] : secondSDGoal,
      secondSDGoalPercentage: controls ? [secondSDGoalPercentage, CustomValidators.required] : secondSDGoalPercentage,
      thirdSDGoal: controls ? [thirdSDGoal, CustomValidators.required] : thirdSDGoal,
      thirdSDGoalPercentage: controls ? [thirdSDGoalPercentage, CustomValidators.required] : thirdSDGoalPercentage
    }
  }

  buildSummaryTab(controls: boolean = false): any {
    const {
      needsAssessment,
      goal,
      directFemaleBeneficiaries,
      directMaleBeneficiaries,
      indirectFemaleBeneficiaries,
      indirectMaleBeneficiaries,
      beneficiaries0to5,
      beneficiaries5to18,
      beneficiaries19to60,
      beneficiariesOver60,
      successItems,
      outputs,
      expectedImpact,
      expectedResults,
      sustainabilityItems
    } = this;
    return {
      needsAssessment: controls ? [needsAssessment, CustomValidators.required] : needsAssessment,
      goal: controls ? [goal, CustomValidators.required] : goal,
      directFemaleBeneficiaries: controls ? [directFemaleBeneficiaries, CustomValidators.required] : directFemaleBeneficiaries,
      directMaleBeneficiaries: controls ? [directMaleBeneficiaries, CustomValidators.required] : directMaleBeneficiaries,
      indirectFemaleBeneficiaries: controls ? [indirectFemaleBeneficiaries, CustomValidators.required] : indirectFemaleBeneficiaries,
      indirectMaleBeneficiaries: controls ? [indirectMaleBeneficiaries, CustomValidators.required] : indirectMaleBeneficiaries,
      beneficiaries0to5: controls ? [beneficiaries0to5, CustomValidators.required] : beneficiaries0to5,
      beneficiaries5to18: controls ? [beneficiaries5to18, CustomValidators.required] : beneficiaries5to18,
      beneficiaries19to60: controls ? [beneficiaries19to60, CustomValidators.required] : beneficiaries19to60,
      beneficiariesOver60: controls ? [beneficiariesOver60, CustomValidators.required] : beneficiariesOver60,
      successItems: controls ? [successItems, CustomValidators.required] : successItems,
      outputs: controls ? [outputs, CustomValidators.required] : outputs,
      expectedImpact: controls ? [expectedImpact, CustomValidators.required] : expectedImpact,
      expectedResults: controls ? [expectedResults, CustomValidators.required] : expectedResults,
      sustainabilityItems: controls ? [sustainabilityItems, CustomValidators.required] : sustainabilityItems
    }
  }
}
