import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {MeetingAttendanceMainItem} from '@app/models/meeting-attendance-main-item';
import {InterceptModel} from '@decorators/intercept-model';
import {MeetingAttendanceReportInterceptor} from '@app/model-interceptors/meeting-attendance-report-interceptor';

const interceptor = new MeetingAttendanceReportInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})

export class MeetingAttendanceReport extends SearchableCloneable<MeetingAttendanceReport>{
  meetingMainItem!: MeetingAttendanceMainItem[];
}
