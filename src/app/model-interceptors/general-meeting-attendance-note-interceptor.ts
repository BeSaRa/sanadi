import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GeneralMeetingAttendanceNote} from '@app/models/general-meeting-attendance-note';

export class GeneralMeetingAttendanceNoteInterceptor implements IModelInterceptor<GeneralMeetingAttendanceNote> {
  caseInterceptor?: IModelInterceptor<GeneralMeetingAttendanceNote> | undefined;

  send(model: Partial<GeneralMeetingAttendanceNote>): Partial<GeneralMeetingAttendanceNote> {
    delete model.searchFields;
    return model;
  }

  receive(model: GeneralMeetingAttendanceNote): GeneralMeetingAttendanceNote {
    return model;
  }
}
