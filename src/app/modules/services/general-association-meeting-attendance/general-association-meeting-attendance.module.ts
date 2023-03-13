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
    ManagePrevInternalUsersComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    GeneralAssociationMeetingAttendanceRoutingModule
  ]
})
export class GeneralAssociationMeetingAttendanceModule { }
