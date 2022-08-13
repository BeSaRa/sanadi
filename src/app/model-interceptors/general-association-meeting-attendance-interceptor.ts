import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GeneralAssociationMeetingAttendance} from '@app/models/general-association-meeting-attendance';

export class GeneralAssociationMeetingAttendanceInterceptor implements IModelInterceptor<GeneralAssociationMeetingAttendance>{
    caseInterceptor?: IModelInterceptor<GeneralAssociationMeetingAttendance> | undefined;
    send(model: Partial<GeneralAssociationMeetingAttendance>): Partial<GeneralAssociationMeetingAttendance> {
        return model;
    }
    receive(model: GeneralAssociationMeetingAttendance): GeneralAssociationMeetingAttendance {
        return model;
    }
}
