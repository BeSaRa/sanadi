import {BaseLicense} from "@app/models/base-license";
import {AdminResult} from "@app/models/admin-result";

export class InitialApprovalDocument extends BaseLicense {
  enName!: string;
  arName!: string;
  country!: number;
  region!: number;
  customTerms!: string;
  publicTerms!: string;
  countryInfo!: AdminResult;
  regionInfo!: AdminResult;
  licenseStatusInfo!: AdminResult;
}
