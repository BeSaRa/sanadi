import {LicenseApprovalModel} from '@app/models/license-approval-model';
import {InternalProjectLicenseService} from '@app/services/internal-project-license.service';
import {FactoryService} from '@app/services/factory.service';
import {ProjectComponent} from '@app/models/project-component';
import {CaseTypes} from '@app/enums/case-types.enum';
import {CustomValidators} from '@app/validators/custom-validators';
import {CommonUtils} from '@app/helpers/common-utils';
import {AdminResult} from '@app/models/admin-result';
import {DateUtils} from '@app/helpers/date-utils';
import {Validators} from '@angular/forms';

export class InternalProjectLicense extends LicenseApprovalModel<InternalProjectLicenseService, InternalProjectLicense> {
  service: InternalProjectLicenseService;

  constructor() {
    super();
    this.service = FactoryService.getService('InternalProjectLicenseService');
  }

  caseType: number = CaseTypes.INTERNAL_PROJECT_LICENSE;
  organizationId!: number;
  administrativedeductionAmount!: number;
  ageAverageCategory: number = 0;
  arName!: string;
  beneficiaries0to5: number = 0;
  beneficiaries5to18: number = 0;
  beneficiaries19to60: number = 0;
  beneficiariesOver60: number = 0;
  beneficiaryFamiliesNumber: number = 0;
  chiefDecision?: number;
  chiefJustification: string = '';
  componentList: ProjectComponent[] = [];
  description!: string;
  directBeneficiaryNumber: number = 0;
  domain!: number;
  enName!: string;
  expectedImpact!: string;
  expectedImpactDate!: string;
  expectedResults!: string;
  exportedLicenseFullserial!: string;
  exportedLicenseId!: string;
  exportedLicenseSerial!: number;
  firstSDGoal!: number;
  firstSDGoalPercentage: number = 0;
  firstSubDomain!: number;
  followUpDate!: string;
  generalManagerDecision?: number;
  generalManagerJustification: string = ''
  goals!: string;
  handicappedBeneficiaryNumber: number = 0;
  hasFamilyBeneficiaries: boolean = false;
  hasIndividualBeneficiaries: boolean = false;
  indirectBeneficiaryNumber: number = 0;
  individualsAverageNumber: number = 0; // (family average number of people)
  licenseVSID?: string;
  managerDecision?: number;
  managerJustification: string = '';
  needsAssessment!: string;
  oldLicenseFullserial!: string;
  oldLicenseId!: string;
  oldLicenseSerial!: number;
  organizationCode!: string;
  outputs!: string;
  projectDescription!: string;
  projectTotalCost!: number;
  projectType!: number;
  reviewerDepartmentDecision?: number;
  reviewerDepartmentJustification: string = '';
  secondSDGoal!: number;
  secondSDGoalPercentage: number = 0;
  secondSubDomain!: number;
  specialistDecision?: number;
  specialistJustification: string = '';
  subject!: string;
  successItems!: string;
  sustainabilityItems!: string;
  targetAmount!: string;
  targetedNationalities: number[] | null = [];
  thirdSDGoal!: number;
  thirdSDGoalPercentage: number = 0;
  targetedCategory!: number;
  year!: number;
  inRenewalPeriod!: boolean;
  managerDecisionInfo!: AdminResult
  reviewerDepartmentDecisionInfo!: AdminResult
  licenseStatusInfo!: AdminResult
  specialistDecisionInfo!: AdminResult
  chiefDecisionInfo!: AdminResult
  generalManagerDecisionInfo!: AdminResult
  projectTypeInfo!: AdminResult
  domainInfo!: AdminResult
  firstSubDomainInfo!: AdminResult
  secondSubDomainInfo!: AdminResult
  firstSDGoalInfo!: AdminResult;
  secondSDGoalInfo!: AdminResult;
  thirdSDGoalInfo!: AdminResult;
  targetNationalitiesInfo!: AdminResult[] | null;
  className!: string;
  usedInProjectCompletion: boolean = false;
  // temp properties
  projectNameInfo!: AdminResult;
  allNationalities: boolean = true;

  getBasicFormFields(control: boolean = false): any {
    const {
      requestType,
      projectType,
      oldLicenseFullserial,
      oldLicenseId,
      oldLicenseSerial,
      arName,
      enName,
      projectDescription
    } = this;

    return {
      requestType: control ? [requestType, [CustomValidators.required]] : requestType,
      projectType: control ? [projectType, [CustomValidators.required]] : projectType,
      oldLicenseFullserial: control ? [oldLicenseFullserial, [CustomValidators.maxLength(250)]] : oldLicenseFullserial,
      oldLicenseId: control ? [oldLicenseId] : oldLicenseId,
      oldLicenseSerial: control ? [oldLicenseSerial] : oldLicenseSerial,
      arName: control ? [arName, [CustomValidators.required, CustomValidators.pattern('AR_ONLY'),
        CustomValidators.maxLength(250),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : arName,
      enName: control ? [enName, [CustomValidators.required, CustomValidators.pattern('ENG_ONLY'),
        CustomValidators.maxLength(250),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : enName,
      projectDescription: control ? [projectDescription, [CustomValidators.required, CustomValidators.maxLength(1200)]] : projectDescription
    }
  }

  getProjectCategoryFields(control: boolean = false): any {
    const {
      domain,
      firstSubDomain,
      secondSubDomain,
      firstSDGoal,
      secondSDGoal,
      thirdSDGoal
    } = this;

    return {
      domain: control ? [domain, [CustomValidators.required]] : domain,
      firstSubDomain: control ? [firstSubDomain, [CustomValidators.required]] : firstSubDomain,
      secondSubDomain: control ? [secondSubDomain, [CustomValidators.required]] : secondSubDomain,
      firstSDGoal: control ? [firstSDGoal, [CustomValidators.required]] : firstSDGoal,
      secondSDGoal: control ? [secondSDGoal, [CustomValidators.required]] : secondSDGoal,
      thirdSDGoal: control ? [thirdSDGoal, [CustomValidators.required]] : thirdSDGoal,
    }
  }

  getProjectCategoryPercentFields(control: boolean = false): any {
    const {
      firstSDGoalPercentage,
      secondSDGoalPercentage,
      thirdSDGoalPercentage
    } = this;

    return {
      firstSDGoalPercentage: control ? [firstSDGoalPercentage, [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]] : firstSDGoalPercentage,
      secondSDGoalPercentage: control ? [secondSDGoalPercentage, [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]] : secondSDGoalPercentage,
      thirdSDGoalPercentage: control ? [thirdSDGoalPercentage, [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]] : thirdSDGoalPercentage
    }
  }

  getProjectSummaryFields(control: boolean = false): any {
    const {
      needsAssessment,
      goals,
      outputs,
      successItems,
      expectedResults,
      expectedImpact,
      sustainabilityItems
    } = this;

    return {
      needsAssessment: control ? [needsAssessment, [CustomValidators.required, CustomValidators.maxLength(1200)]] : needsAssessment,
      goals: control ? [goals, [CustomValidators.required, CustomValidators.maxLength(1200)]] : goals,
      outputs: control ? [outputs, [CustomValidators.required, CustomValidators.maxLength(1200)]] : outputs,
      successItems: control ? [successItems, [CustomValidators.required, CustomValidators.maxLength(1200)]] : successItems,
      expectedResults: control ? [expectedResults, [CustomValidators.required, CustomValidators.maxLength(1200)]] : expectedResults,
      expectedImpact: control ? [expectedImpact, [CustomValidators.required, CustomValidators.maxLength(1200)]] : expectedImpact,
      sustainabilityItems: control ? [sustainabilityItems, [CustomValidators.required, CustomValidators.maxLength(1200)]] : sustainabilityItems,
    }
  }

  getBeneficiaryAnalysisFields(control: boolean = false): any {
    const {
      allNationalities,
      targetedNationalities,
      // individual
      hasIndividualBeneficiaries,
      directBeneficiaryNumber,
      indirectBeneficiaryNumber,
      handicappedBeneficiaryNumber,
      //family
      hasFamilyBeneficiaries,
      beneficiaryFamiliesNumber,
      individualsAverageNumber, //(family average number of people)
      ageAverageCategory
    } = this;

    return {
      allNationalities: control ? [allNationalities] : allNationalities,
      targetedNationalities: control ? [targetedNationalities] : targetedNationalities,
      // individual
      hasIndividualBeneficiaries: control ? [directBeneficiaryNumber] : hasIndividualBeneficiaries,
      directBeneficiaryNumber: control ? [directBeneficiaryNumber, [CustomValidators.number, CustomValidators.maxLength(20)]] : directBeneficiaryNumber,
      indirectBeneficiaryNumber: control ? [indirectBeneficiaryNumber, [CustomValidators.number, CustomValidators.maxLength(20)]] : indirectBeneficiaryNumber,
      handicappedBeneficiaryNumber: control ? [handicappedBeneficiaryNumber, [CustomValidators.number, CustomValidators.maxLength(20)]] : handicappedBeneficiaryNumber,
      // family
      hasFamilyBeneficiaries: control ? [hasFamilyBeneficiaries] : hasFamilyBeneficiaries,
      beneficiaryFamiliesNumber: control ? [beneficiaryFamiliesNumber, [CustomValidators.number, CustomValidators.maxLength(20)]] : beneficiaryFamiliesNumber,
      individualsAverageNumber: control ? [individualsAverageNumber, [CustomValidators.number, CustomValidators.maxLength(20)]] : individualsAverageNumber,
      ageAverageCategory: control ? [ageAverageCategory, [CustomValidators.number, CustomValidators.maxLength(20)]] : ageAverageCategory
    }
  }

  getBeneficiaryAnalysisDirectPercentFields(control: boolean = false): any {
    const {
      beneficiaries0to5,
      beneficiaries5to18,
      beneficiaries19to60,
      beneficiariesOver60
    } = this;

    return {
      beneficiaries0to5: control ? [beneficiaries0to5, [CustomValidators.decimal(2), Validators.max(100)]] : beneficiaries0to5,
      beneficiaries5to18: control ? [beneficiaries5to18, [CustomValidators.decimal(2), Validators.max(100)]] : beneficiaries5to18,
      beneficiaries19to60: control ? [beneficiaries19to60, [CustomValidators.decimal(2), Validators.max(100)]] : beneficiaries19to60,
      beneficiariesOver60: control ? [beneficiariesOver60, [CustomValidators.decimal(2), Validators.max(100)]] : beneficiariesOver60
    }
  }

  getProjectBudgetFields(control: boolean = false): any {
    const {
      deductionPercent,
      projectTotalCost, // total of all components total cost
      administrativedeductionAmount,
      targetAmount, // calculated from BE
      expectedImpactDate,
      licenseDuration, // duration in months
    } = this;

    return {
      deductionPercent: control ? [deductionPercent, [CustomValidators.required, CustomValidators.decimal(2), CustomValidators.maxLength(10)]] : deductionPercent,
      projectTotalCost: control ? [projectTotalCost, [CustomValidators.required, CustomValidators.decimal(2)]] : projectTotalCost,
      administrativedeductionAmount: control ? [administrativedeductionAmount, [CustomValidators.required, CustomValidators.decimal(2)]] : administrativedeductionAmount,
      targetAmount: control ? [targetAmount] : targetAmount,
      expectedImpactDate: control ? [expectedImpactDate, [CustomValidators.required]] : DateUtils.changeDateToDatepicker(expectedImpactDate),
      licenseDuration: control ? [licenseDuration, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(3)]] : licenseDuration
    }
  }

  getSpecialExplanationFields(control: boolean = false): any {
    const {
      description
    } = this;

    return {
      description: control ? [description, [CustomValidators.required, CustomValidators.maxLength(1200)]] : description
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

  getAdminDeductionCost(deductionPercent: number, numberOfDecimalPlaces: number = 2): number {
    if (!CommonUtils.isValidValue(deductionPercent) || this.getTotalProjectComponentCost(2) === 0) {
      return 0;
    }
    deductionPercent = Number(Number(deductionPercent).toFixed(numberOfDecimalPlaces));
    return Number(((deductionPercent / 100) * (this.getTotalProjectComponentCost(2))).toFixed(numberOfDecimalPlaces));
  }

  getTargetCost(deductionPercent: number, numberOfDecimalPlaces: number = 2): number {
    return Number((this.getAdminDeductionCost(deductionPercent, numberOfDecimalPlaces) + this.getTotalProjectComponentCost(numberOfDecimalPlaces)).toFixed(numberOfDecimalPlaces));
  }

}
