import {ICaseSearchCriteria} from '@app/interfaces/icase-search-criteria';
import {InternalProjectLicense} from '@app/models/internal-project-license';

export class InternalProjectLicenseSearchCriteria extends InternalProjectLicense implements ICaseSearchCriteria {
  mimeType!: string;
  documentTitle!: string;
  lockTimeout!: string;
  lockOwner!: string;
  forceUpdateContent!: boolean;
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
  beneficiaries18to60!: number;

}
