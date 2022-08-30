import {SearchableCloneable} from '@app/models/searchable-cloneable';

export class MeetingAttendanceSubItem extends SearchableCloneable<MeetingAttendanceSubItem>{
  enName!: string;
  comment!: string;
  respectTerms!: boolean | number;
}
