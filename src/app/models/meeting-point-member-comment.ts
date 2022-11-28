import {SearchableCloneable} from '@app/models/searchable-cloneable';

export class MeetingPointMemberComment extends SearchableCloneable<MeetingPointMemberComment>{
  arName!: string;
  comment!: string;
  enName!: string;
  userId!: number;
}
