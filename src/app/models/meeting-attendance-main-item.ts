import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {MeetingAttendanceSubItem} from '@app/models/meeting-attendance-sub-item';

export class MeetingAttendanceMainItem extends SearchableCloneable<MeetingAttendanceMainItem>{
  enName!: string;
  meetingSubItem!: MeetingAttendanceSubItem[];
}
