import { Component, Input, OnInit } from '@angular/core';
import { LangService } from '@services/lang.service';
import { GeneralAssociationMeetingAttendanceService } from '@services/general-association-meeting-attendance.service';
import { GeneralAssociationInternalMember } from '@app/models/general-association-internal-member';
import { GeneralAssociationInternalMemberTypeEnum } from '@app/enums/general-association-internal-member-type-enum';
import { GeneralAssociationMeetingAttendance } from '@app/models/general-association-meeting-attendance';
import { MeetingAttendanceReport } from '@app/models/meeting-attendance-report';
import { GeneralMeetingAttendanceNote } from '@app/models/general-meeting-attendance-note';
import { GeneralMeetingsMemberStatus } from '@app/interfaces/general-meetings-member-status';

@Component({
  selector: 'manage-prev-internal-users',
  templateUrl: './manage-prev-internal-users.component.html',
  styleUrls: ['./manage-prev-internal-users.component.scss']
})
export class ManagePrevInternalUsersComponent implements OnInit {
  @Input() model!: GeneralAssociationMeetingAttendance;
  @Input() selectedInternalUsers: GeneralAssociationInternalMember[] = [];
  @Input() meetingReport!: MeetingAttendanceReport;
  @Input() generalNotes: GeneralMeetingAttendanceNote[] = [];

  selectedInternalUser!: GeneralAssociationInternalMember | null;

  membersDisplayedColumns: string[] = ['index', 'arabicName', 'englishName', 'isDecisionMaker', 'status', 'actions'];
  internalUserType = GeneralAssociationInternalMemberTypeEnum;

  constructor(
    public lang: LangService,
    private generalAssociationMeetingService: GeneralAssociationMeetingAttendanceService) {
  }

  ngOnInit(): void {
  }

  viewMemberCommentsAndNotes(event: MouseEvent, model: GeneralAssociationInternalMember) {
    event.preventDefault();
    this.generalAssociationMeetingService.openViewMemberCommentsAndNotesDialog(model, this.meetingReport, this.generalNotes, model.userId, this.model?.id);
  }
  isTerminatedMember(row: GeneralAssociationInternalMember) {
    return row.name == GeneralMeetingsMemberStatus.terminated
  }
}
