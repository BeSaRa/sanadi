import {InitialExternalOfficeApprovalResult} from "@app/models/initial-external-office-approval-result";
import {InitialExternalOfficeApproval} from '@app/models/initial-external-office-approval';
import {ICaseSearchCriteria} from '@app/interfaces/icase-search-criteria';

export class InitialExternalOfficeApprovalSearchCriteria extends InitialExternalOfficeApproval implements ICaseSearchCriteria {
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
