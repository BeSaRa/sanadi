import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {MeetingAttendanceReport} from '@app/models/meeting-attendance-report';
import {MeetingAttendanceMainItemInterceptor} from '@app/model-interceptors/meeting-attendance-main-item-interceptor';
import {MeetingAttendanceMainItem} from '@app/models/meeting-attendance-main-item';
import {MeetingAttendanceSubItem} from '@app/models/meeting-attendance-sub-item';
import {MeetingAttendanceSubItemInterceptor} from '@app/model-interceptors/meeting-attendance-sub-item-interceptor';
import {MeetingPointMemberComment} from '@app/models/meeting-point-member-comment';
import {MeetingPointMemberCommentInterceptor} from '@app/model-interceptors/meeting-point-member-comment-interceptor';

export class MeetingAttendanceReportInterceptor implements IModelInterceptor<MeetingAttendanceReport> {
  caseInterceptor?: IModelInterceptor<MeetingAttendanceReport> | undefined;

  send(model: Partial<MeetingAttendanceReport>): Partial<MeetingAttendanceReport> {
    let mainItemInterceptor = new MeetingAttendanceMainItemInterceptor();
    let subItemInterceptor = new MeetingAttendanceSubItemInterceptor();
    let memberCommentInterceptor = new MeetingPointMemberCommentInterceptor();
    delete model.searchFields;
    model.meetingMainItem = model.meetingMainItem?.map(x => {
      let meetingMainItem = new MeetingAttendanceMainItem().clone(mainItemInterceptor.send(x)) as MeetingAttendanceMainItem;
      meetingMainItem.meetingSubItem = meetingMainItem.meetingSubItem?.map(sub => {
        let meetingSubItem = new MeetingAttendanceSubItem().clone(subItemInterceptor.send(sub)) as MeetingAttendanceSubItem;
        meetingSubItem.userComments = meetingSubItem.userComments?.map(comment => {
          return new MeetingPointMemberComment().clone(memberCommentInterceptor.send(comment)) as MeetingPointMemberComment;
        });
        return meetingSubItem;
      });
      return meetingMainItem;
    });

    return model;
  }

  receive(model: MeetingAttendanceReport): MeetingAttendanceReport {
    let mainItemInterceptor = new MeetingAttendanceMainItemInterceptor();
    let subItemInterceptor = new MeetingAttendanceSubItemInterceptor();
    let memberCommentInterceptor = new MeetingPointMemberCommentInterceptor();
    model.meetingMainItem = model.meetingMainItem?.map(x => {
      let meetingMainItem = new MeetingAttendanceMainItem().clone(mainItemInterceptor.receive(x)) as MeetingAttendanceMainItem;
      meetingMainItem.meetingSubItem = meetingMainItem.meetingSubItem?.map(sub => {
        let meetingSubItem = new MeetingAttendanceSubItem().clone(subItemInterceptor.receive(sub)) as MeetingAttendanceSubItem;
        meetingSubItem.userComments = meetingSubItem.userComments?.map(comment => {
          return new MeetingPointMemberComment().clone(memberCommentInterceptor.receive(comment)) as MeetingPointMemberComment;
        });
        return meetingSubItem;
      });
      return meetingMainItem;
    });

    return model;
  }
}
