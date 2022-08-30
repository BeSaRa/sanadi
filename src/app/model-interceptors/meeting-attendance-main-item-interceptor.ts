import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {MeetingAttendanceMainItem} from '@app/models/meeting-attendance-main-item';

export class MeetingAttendanceMainItemInterceptor implements IModelInterceptor<MeetingAttendanceMainItem>{
    caseInterceptor?: IModelInterceptor<MeetingAttendanceMainItem> | undefined;
    send(model: Partial<MeetingAttendanceMainItem>): Partial<MeetingAttendanceMainItem> {
      delete model.searchFields;
        return model
    }
    receive(model: MeetingAttendanceMainItem): MeetingAttendanceMainItem {
        return model;
    }
}
