import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {MeetingAttendanceSubItem} from '@app/models/meeting-attendance-sub-item';

export class MeetingAttendanceMainItem extends SearchableCloneable<MeetingAttendanceMainItem>{
  id!: number;
  caseID!: string;
  enName!: string;
  meetingSubItem!: MeetingAttendanceSubItem[];

  decisionMakerID!: number;
  memberID!: number;
  addedByDecisionMaker!: boolean;
  status!: number;
  finalItem!: number;
}
