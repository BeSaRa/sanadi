import {AdminResult} from '@app/models/admin-result';
import {SearchableCloneable} from '@app/models/searchable-cloneable';

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
}
