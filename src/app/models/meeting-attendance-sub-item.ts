import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {MeetingPointMemberComment} from '@app/models/meeting-point-member-comment';

export class MeetingAttendanceSubItem extends SearchableCloneable<MeetingAttendanceSubItem>{
  id!:number;
  enName!: string;
  comment!: string;
  respectTerms?: boolean | number;
  userComments?: MeetingPointMemberComment[];
  mainItemID!: number;
  memberID!: number;
  status!: number;
  selected?: boolean;
}
