import {InternalProjectLicense} from '@app/models/internal-project-license';

export class SearchInternalProjectLicenseCriteria extends InternalProjectLicense {
  assignDateFrom!: string;
  assignDateTo!: string;
  createdOnFrom!: string;
  createdOnTo!: string;
  lastModifiedFrom!: string;
  lastModifiedTo!: string;
}
