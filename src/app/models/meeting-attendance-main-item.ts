import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {MeetingAttendanceSubItem} from '@app/models/meeting-attendance-sub-item';

export class MeetingAttendanceMainItem extends SearchableCloneable<MeetingAttendanceMainItem>{
  id!: number;
  enName!: string;
  meetingSubItem!: MeetingAttendanceSubItem[];
}
