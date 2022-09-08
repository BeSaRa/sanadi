import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {MeetingAttendanceSubItem} from '@app/models/meeting-attendance-sub-item';
import {MeetingPointMemberCommentInterceptor} from '@app/model-interceptors/meeting-point-member-comment-interceptor';
import {MeetingPointMemberComment} from '@app/models/meeting-point-member-comment';

export class MeetingAttendanceSubItemInterceptor implements IModelInterceptor<MeetingAttendanceSubItem> {
  caseInterceptor?: IModelInterceptor<MeetingAttendanceSubItem> | undefined;

  send(model: Partial<MeetingAttendanceSubItem>): Partial<MeetingAttendanceSubItem> {
    let memberCommentInterceptor = new MeetingPointMemberCommentInterceptor();
    delete model.searchFields;
    model.respectTerms = +model?.respectTerms!;
    model.userComments?.map(comment => {
      return new MeetingPointMemberComment().clone(memberCommentInterceptor.send(comment)) as MeetingPointMemberComment;
    });
    return model;
  }

  receive(model: MeetingAttendanceSubItem): MeetingAttendanceSubItem {
    return model;
  }
}
