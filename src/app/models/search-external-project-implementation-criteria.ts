import {ExternalProjectImplementation} from '@app/models/external-project-implementation';

export class SearchExternalProjectImplementationCriteria extends ExternalProjectImplementation {
  assignDateFrom!: string;
  assignDateTo!: string;
  createdOnFrom!: string;
  createdOnTo!: string;
  lastModifiedFrom!: string;
  lastModifiedTo!: string;
}
