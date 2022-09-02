import {SearchableCloneable} from '@app/models/searchable-cloneable';

export class MeetingAttendanceSubItem extends SearchableCloneable<MeetingAttendanceSubItem>{
  id!:number;
  enName!: string;
  comment!: string;
  respectTerms!: boolean | number;
}
