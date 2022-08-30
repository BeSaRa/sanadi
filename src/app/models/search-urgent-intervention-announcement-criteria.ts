import {UrgentInterventionAnnouncement} from '@app/models/urgent-intervention-announcement';

export class SearchUrgentInterventionAnnouncementCriteria extends UrgentInterventionAnnouncement {
  createdOnFrom!: string;
  createdOnTo!: string;
  lastModifiedFrom!: string;
  lastModifiedTo!: string;
}
