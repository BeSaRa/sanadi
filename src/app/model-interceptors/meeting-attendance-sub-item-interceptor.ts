import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {MeetingAttendanceSubItem} from '@app/models/meeting-attendance-sub-item';

export class MeetingAttendanceSubItemInterceptor implements IModelInterceptor<MeetingAttendanceSubItem> {
  caseInterceptor?: IModelInterceptor<MeetingAttendanceSubItem> | undefined;

  send(model: Partial<MeetingAttendanceSubItem>): Partial<MeetingAttendanceSubItem> {
    delete model.searchFields;
    model.respectTerms = +model?.respectTerms!;
    return model;
  }

  receive(model: MeetingAttendanceSubItem): MeetingAttendanceSubItem {
    return model;
  }
}
