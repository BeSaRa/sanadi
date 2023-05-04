import {AdminResult} from '@app/models/admin-result';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import { CustomValidators } from '@app/validators/custom-validators';

export class TransferFundsCharityPurpose extends SearchableCloneable<TransferFundsCharityPurpose> {
  mainDACCategory!: number;
  mainUNOCHACategory!: number;
  projectName!: string;
  projectType!: number;
  totalCost!: number;
  projectImplementationPeriod!: number;
  domain!: number;
  beneficiaryCountry!: number;
  executionCountry!: number;
  domainInfo!: AdminResult;
  mainDACCategoryInfo!: AdminResult;
  mainUNOCHACategoryInfo!: AdminResult;
  projectTypeInfo!: AdminResult;
  beneficiaryCountryInfo!: AdminResult;
  executionCountryInfo!: AdminResult;

  isEqual(purpose: TransferFundsCharityPurpose): boolean {
    return purpose.projectName === this.projectName &&
      purpose.projectType === this.projectType &&
      purpose.totalCost === this.totalCost &&
      purpose.projectImplementationPeriod === this.projectImplementationPeriod &&
      purpose.domain === this.domain &&
      purpose.beneficiaryCountry === this.beneficiaryCountry &&
      purpose.executionCountry === this.executionCountry;
  }

  isNotEqual(purpose: TransferFundsCharityPurpose): boolean {
    return purpose.projectName !== this.projectName ||
      purpose.projectType !== this.projectType ||
      purpose.totalCost !== this.totalCost ||
      purpose.projectImplementationPeriod !== this.projectImplementationPeriod ||
      purpose.domain !== this.domain ||
      purpose.beneficiaryCountry !== this.beneficiaryCountry ||
      purpose.executionCountry !== this.executionCountry;
  }
  buildForm(controls:boolean){
    const {mainDACCategory,
      mainUNOCHACategory,
      projectName,
      projectType,
      totalCost,
      projectImplementationPeriod,
      domain,
      beneficiaryCountry,
      executionCountry} = this
      return {
        projectName: controls? [projectName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]]:projectName,
        projectType: controls? [projectType, [CustomValidators.required]]:projectType,
        domain: controls? [domain, [CustomValidators.required]]:domain,
        mainUNOCHACategory: controls? [mainUNOCHACategory, []]:mainUNOCHACategory,
        mainDACCategory: controls? [mainDACCategory, []]:mainDACCategory,
        beneficiaryCountry: controls? [beneficiaryCountry, [CustomValidators.required]]:beneficiaryCountry,
        executionCountry: controls? [executionCountry, [CustomValidators.required]]:executionCountry,
        totalCost: controls? [totalCost, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(20)]]:totalCost,
        projectImplementationPeriod: controls? [projectImplementationPeriod, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(2)]]:projectImplementationPeriod
      }
  }
   
}
