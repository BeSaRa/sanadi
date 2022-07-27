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
}
