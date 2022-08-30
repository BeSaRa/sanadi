import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {MeetingAttendanceReport} from '@app/models/meeting-attendance-report';
import {MeetingAttendanceMainItemInterceptor} from '@app/model-interceptors/meeting-attendance-main-item-interceptor';
import {MeetingAttendanceMainItem} from '@app/models/meeting-attendance-main-item';
import {MeetingAttendanceSubItem} from '@app/models/meeting-attendance-sub-item';
import {MeetingAttendanceSubItemInterceptor} from '@app/model-interceptors/meeting-attendance-sub-item-interceptor';

export class MeetingAttendanceReportInterceptor implements IModelInterceptor<MeetingAttendanceReport> {
  caseInterceptor?: IModelInterceptor<MeetingAttendanceReport> | undefined;

  send(model: Partial<MeetingAttendanceReport>): Partial<MeetingAttendanceReport> {
    let mainItemInterceptor = new MeetingAttendanceMainItemInterceptor();
    let subItemInterceptor = new MeetingAttendanceSubItemInterceptor();
    delete model.searchFields;
    model.meetingMainItem = model.meetingMainItem?.map(x => {
      let meetingMainItem = mainItemInterceptor.send(x) as MeetingAttendanceMainItem;
      meetingMainItem.meetingSubItem = meetingMainItem.meetingSubItem?.map(sub => {
        let meetingSubItem = subItemInterceptor.send(sub) as MeetingAttendanceSubItem;
        return meetingSubItem;
      });
      return meetingMainItem;
    });

    return model;
  }

  receive(model: MeetingAttendanceReport): MeetingAttendanceReport {
    return model;
  }
}
