import {UrgentInterventionLicenseFollowup} from '@app/models/urgent-intervention-license-followup';

export class SearchUrgentInterventionLicenseFollowupCriteria  extends UrgentInterventionLicenseFollowup {
  assignDateFrom!: string;
  assignDateTo!: string;
  createdOnFrom!: string;
  createdOnTo!: string;
  lastModifiedFrom!: string;
  lastModifiedTo!: string;
}
