import {InitialApprovalDocument} from "@app/models/initial-approval-document";

export class InitialApprovalDocSearchCriteria extends InitialApprovalDocument {
  createdOnFrom!: string;
  createdOnTo!: string;
  lastModifiedFrom!: string;
  lastModifiedTo!: string;
  licenseStartDateFrom!: string;
  licenseStartDateTo!: string;
  licenseEndDateFrom!: string;
  licenseEndDateTo!: string;
  licenseApprovedDateFrom!: string;
  licenseApprovedDateTo!: string;
}
