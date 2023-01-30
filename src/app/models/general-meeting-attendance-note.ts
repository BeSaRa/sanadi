import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {InterceptModel} from '@decorators/intercept-model';
import {GeneralMeetingAttendanceNoteInterceptor} from '@app/model-interceptors/general-meeting-attendance-note-interceptor';

const interceptor = new GeneralMeetingAttendanceNoteInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})

export class GeneralMeetingAttendanceNote extends SearchableCloneable<GeneralMeetingAttendanceNote>{
  id!: number;
  comment!: string;
  caseID!: string;
  memberID!: number;
  finalComment!: number;
}
