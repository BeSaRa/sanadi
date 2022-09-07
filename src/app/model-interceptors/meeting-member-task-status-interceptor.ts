import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {MeetingMemberTaskStatus} from '@app/models/meeting-member-task-status';

export class MeetingMemberTaskStatusInterceptor implements IModelInterceptor<MeetingMemberTaskStatus>{
    caseInterceptor?: IModelInterceptor<MeetingMemberTaskStatus> | undefined;
    send(model: Partial<MeetingMemberTaskStatus>): Partial<MeetingMemberTaskStatus> {
        return model;
    }
    receive(model: MeetingMemberTaskStatus): MeetingMemberTaskStatus {
        return model;
    }
}
