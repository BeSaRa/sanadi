import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {MeetingAttendanceMainItem} from '@app/models/meeting-attendance-main-item';
import {MeetingAttendanceSubItem} from '@app/models/meeting-attendance-sub-item';
import {MeetingAttendanceSubItemInterceptor} from '@app/model-interceptors/meeting-attendance-sub-item-interceptor';

export class MeetingAttendanceMainItemInterceptor implements IModelInterceptor<MeetingAttendanceMainItem> {
  caseInterceptor?: IModelInterceptor<MeetingAttendanceMainItem> | undefined;

  send(model: Partial<MeetingAttendanceMainItem>): Partial<MeetingAttendanceMainItem> {
    let subItemInterceptor = new MeetingAttendanceSubItemInterceptor();
    model.meetingSubItem?.map(sub => {
      return new MeetingAttendanceSubItem().clone(subItemInterceptor.send(sub)) as MeetingAttendanceSubItem;
    });
    delete model.searchFields;
    return model;
  }

  receive(model: MeetingAttendanceMainItem): MeetingAttendanceMainItem {
    return model;
  }
}
