import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {MeetingPointMemberComment} from '@app/models/meeting-point-member-comment';

export class MeetingPointMemberCommentInterceptor implements IModelInterceptor<MeetingPointMemberComment>{
    caseInterceptor?: IModelInterceptor<MeetingPointMemberComment> | undefined;
    send(model: Partial<MeetingPointMemberComment>): Partial<MeetingPointMemberComment> {
        return model
    }
    receive(model: MeetingPointMemberComment): MeetingPointMemberComment {
        return model;
    }
}
