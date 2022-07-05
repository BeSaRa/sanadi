import {UrgentInterventionReport} from '@app/models/urgent-intervention-report';

export class SearchUrgentInterventionReportCriteria extends UrgentInterventionReport {
  createdOnFrom!: string;
  createdOnTo!: string;
  lastModifiedFrom!: string;
  lastModifiedTo!: string;
}
