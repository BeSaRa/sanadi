import { AuditGeneralAssociationMeetingAttendanceComponent } from './audit/audit-general-association-meeting-attendance/audit-general-association-meeting-attendance.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralAssociationMeetingAttendanceRoutingModule } from './general-association-meeting-attendance-routing.module';
import { GeneralAssociationMeetingAttendanceOutputsComponent } from './pages/general-association-meeting-attendance-outputs/general-association-meeting-attendance-outputs.component';
import {
  GeneralAssociationMeetingAttendanceComponent
} from '@modules/services/general-association-meeting-attendance/pages/general-association-meeting-attendance/general-association-meeting-attendance.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  GeneralAssociationMeetingCompleteTaskPopupComponent
} from '@modules/services/general-association-meeting-attendance/popups/general-association-meeting-complete-task-popup/general-association-meeting-complete-task-popup.component';
import {
  GeneralAssociationMeetingApproveTaskPopupComponent
} from '@modules/services/general-association-meeting-attendance/popups/general-association-meeting-approve-task-popup/general-association-meeting-approve-task-popup.component';
import {
  ManageMembersComponent
} from '@modules/services/general-association-meeting-attendance/shared/manage-members/manage-members.component';
import {
  ManageInternalUsersComponent
} from '@modules/services/general-association-meeting-attendance/shared/manage-internal-users/manage-internal-users.component';
import {
  SelectMemberPopupComponent
} from '@modules/services/general-association-meeting-attendance/popups/select-member-popup-component/select-member-popup.component';
import {
  MeetingPointMembersCommentsPopupComponent
} from '@modules/services/general-association-meeting-attendance/popups/meeting-point-members-comments-popup/meeting-point-members-comments-popup.component';
import {
  SpecificMemberCommentsAndNotesComponent
} from '@modules/services/general-association-meeting-attendance/popups/specific-member-comments-and-notes/specific-member-comments-and-notes.component';
import { ManagePrevInternalUsersComponent } from '@modules/services/general-association-meeting-attendance/shared/manage-prev-internal-users/manage-prev-internal-users.component';
import { AuditGeneralAssociationExternalMemberComponent } from './audit/audit-general-association-external-member/audit-general-association-external-member.component';
import { AuditMeetingAgendaComponent } from './audit/audit-meeting-agenda/audit-meeting-agenda.component';
import { ManageMembersPopupComponent } from './popups/manage-members-popup/manage-members-popup.component';
import { MeetingAgendaListComponent } from './shared/meeting-agenda-list/meeting-agenda-list.component';
import { MeetingAgendaPopupComponent } from './popups/meeting-agenda-popup/meeting-agenda-popup.component';
import { GeneralMeetingAttendanceNotesListComponent } from '@modules/services/general-association-meeting-attendance/shared/general-meeting-attendance-notes-list/general-meeting-attendance-notes-list.component';
import { GeneralMeetingAttendanceNotesPopupComponent } from './popups/general-meeting-attendance-notes-popup/general-meeting-attendance-notes-popup.component';


@NgModule({
  declarations: [
    GeneralAssociationMeetingAttendanceComponent,
    GeneralAssociationMeetingAttendanceOutputsComponent,
    GeneralAssociationMeetingCompleteTaskPopupComponent,
    GeneralAssociationMeetingApproveTaskPopupComponent,
    ManageMembersComponent,
    ManageInternalUsersComponent,
    SelectMemberPopupComponent,
    MeetingPointMembersCommentsPopupComponent,
    SpecificMemberCommentsAndNotesComponent,
    ManagePrevInternalUsersComponent,
    AuditGeneralAssociationMeetingAttendanceComponent,
    AuditGeneralAssociationExternalMemberComponent,
    AuditMeetingAgendaComponent,
    ManageMembersPopupComponent,
    MeetingAgendaListComponent,
    MeetingAgendaPopupComponent,
    GeneralMeetingAttendanceNotesListComponent,
    GeneralMeetingAttendanceNotesPopupComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    GeneralAssociationMeetingAttendanceRoutingModule
  ]
})
export class GeneralAssociationMeetingAttendanceModule { }
