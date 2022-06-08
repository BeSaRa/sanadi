import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {IMyDateModel} from 'angular-mydatepicker';

export class ParticipantOrganization extends SearchableCloneable<ParticipantOrganization>{
  organizationId!: number;
  arabicName!: string;
  englishName!: string;
  donation?: number;
  workStartDate?: string | IMyDateModel;
}
