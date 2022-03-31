import {UrgentInterventionLicense} from '@app/models/urgent-intervention-license';

export class SearchUrgentInterventionLicenseCriteria extends UrgentInterventionLicense {
  assignDateFrom!: string;
  assignDateTo!: string;
  createdOnFrom!: string;
  createdOnTo!: string;
  lastModifiedFrom!: string;
  lastModifiedTo!: string;
}
