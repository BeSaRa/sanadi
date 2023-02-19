import { Component, Inject } from '@angular/core';
import { LangService } from '@services/lang.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { MeetingAttendanceReport } from '@app/models/meeting-attendance-report';
import { GeneralMeetingAttendanceNote } from '@app/models/general-meeting-attendance-note';
import { GeneralAssociationInternalMember } from '@app/models/general-association-internal-member';

@Component({
  selector: 'specific-member-comments-and-notes',
  templateUrl: './specific-member-comments-and-notes.component.html',
  styleUrls: ['./specific-member-comments-and-notes.component.scss']
})
export class SpecificMemberCommentsAndNotesComponent {
  subPointsDisplayedColumns: string[] = ['index', 'subPoint', 'comment', 'respectTerms'];
  generalNotesDisplayedColumns: string[] = ['index', 'comment'];
  generalNotes: GeneralMeetingAttendanceNote[] = [];
  constructor(
    @Inject(DIALOG_DATA_TOKEN) public data: {
      internalMember: GeneralAssociationInternalMember,
      meetingReport: MeetingAttendanceReport,
      generalNotes: GeneralMeetingAttendanceNote[],
      userId: number,
      meetingId: string
    },
    public lang: LangService) {
    this.data.meetingReport = JSON.parse(JSON.stringify({ ...this.data.meetingReport })) as MeetingAttendanceReport;

    data.meetingReport.meetingMainItem = data.meetingReport.meetingMainItem.filter((mainItem) => {
      mainItem.meetingSubItem = mainItem.meetingSubItem.filter((subItem) => {
        subItem.userComments = subItem.userComments?.filter(comment => comment.userId === this.data.userId);
        return (subItem.userComments || []).length;
      });
      return mainItem.meetingSubItem.length;
    })

    this.generalNotes = this.data.generalNotes.filter(note => note.memberID === this.data.userId);
  }

  getMemberName(): string {
    return this.lang?.map.lang === 'ar' ? this.data.internalMember.arabicName : this.data.internalMember.englishName;
  }
}
