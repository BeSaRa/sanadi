import {Component, Inject} from '@angular/core';
import {LangService} from '@services/lang.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {MeetingAttendanceReport} from '@app/models/meeting-attendance-report';
import {GeneralMeetingAttendanceNote} from '@app/models/general-meeting-attendance-note';
import {GeneralAssociationInternalMember} from '@app/models/general-association-internal-member';

@Component({
  selector: 'specific-member-comments-and-notes',
  templateUrl: './specific-member-comments-and-notes.component.html',
  styleUrls: ['./specific-member-comments-and-notes.component.scss']
})
export class SpecificMemberCommentsAndNotesComponent {
  subPointsDisplayedColumns: string[] = ['index', 'subPoint', 'comment', 'respectTerms'];
  generalNotesDisplayedColumns: string[] = ['index', 'comment'];

  constructor(
    @Inject(DIALOG_DATA_TOKEN) public data: {
      internalMember: GeneralAssociationInternalMember,
      meetingReport: MeetingAttendanceReport,
      generalNotes: GeneralMeetingAttendanceNote[]
    },
    public lang: LangService) {
  }
}
