import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProjectsRoutingModule} from './projects-routing.module';
import {ProjectsComponent} from './projects.component';
import {
  InternalBankAccountApprovalComponent
} from './pages/internal-bank-account-approval/internal-bank-account-approval.component';
import {
  InternalBankApprovalApproveTaskPopupComponent
} from './popups/internal-bank-approval-approve-task-popup/internal-bank-approval-approve-task-popup.component';
import {CollectionModule} from '@app/modules/collection/collection.module';
import {
  UrgentJointReliefCampaignComponent
} from './pages/urgent-joint-relief-campaign/urgent-joint-relief-campaign.component';
import {
  UrgentJointReliefCampaignInitialApproveTaskPopupComponent
} from './popups/urgent-joint-relief-campaign-initial-approve-task-popup/urgent-joint-relief-campaign-initial-approve-task-popup.component';
import {
  UrgentJointReliefCampaignFinalApproveTaskPopupComponent
} from './popups/urgent-joint-relief-campaign-final-approve-task-popup/urgent-joint-relief-campaign-final-approve-task-popup.component';
import {
  UrgentJointReliefCampaignOrganizationApproveTaskPopupComponent
} from './popups/urgent-joint-relief-campaign-organization-approve-task-popup/urgent-joint-relief-campaign-organization-approve-task-popup.component';
import {EServicesMainModule} from '@app/modules/e-services-main/e-services-main.module';
import {SelectEmployeePopupComponent} from './popups/select-employee-popup/select-employee-popup.component';
import {
  TransferringIndividualFundsAbroadComponent
} from './pages/transferring-individual-funds-abroad/transferring-individual-funds-abroad.component';
import {
  TransferFundsAbroadApproveTaskPopupComponent
} from './popups/transfer-funds-abroad-approve-task-popup/transfer-funds-abroad-approve-task-popup.component';
import {
  SelectReceiverEntityPopupComponent
} from './popups/select-receiver-entity-popup/select-receiver-entity-popup.component';
import {
  TransferFundsAbroadCompleteTaskPopupComponent
} from './popups/transfer-funds-abroad-complete-task-popup/transfer-funds-abroad-complete-task-popup.component';
import {
  GeneralAssociationMeetingAttendanceComponent
} from './pages/general-association-meeting-attendance/general-association-meeting-attendance.component';
import {ManageMembersComponent} from './shared/manage-members/manage-members.component';
import {SelectMemberPopupComponent} from './popups/select-member-popup-component/select-member-popup.component';
import {ManageInternalUsersComponent} from './shared/manage-internal-users/manage-internal-users.component';
import {
  GeneralAssociationMeetingCompleteTaskPopupComponent
} from './popups/general-association-meeting-complete-task-popup/general-association-meeting-complete-task-popup.component';
import {
  GeneralAssociationMeetingApproveTaskPopupComponent
} from './popups/general-association-meeting-approve-task-popup/general-association-meeting-approve-task-popup.component';
import {
  MeetingPointMembersCommentsPopupComponent
} from './popups/meeting-point-members-comments-popup/meeting-point-members-comments-popup.component';
import {
  SpecificMemberCommentsAndNotesComponent
} from './popups/specific-member-comments-and-notes/specific-member-comments-and-notes.component';

@NgModule({
  declarations: [
    ProjectsComponent,
    InternalBankAccountApprovalComponent,
    InternalBankApprovalApproveTaskPopupComponent,
    UrgentJointReliefCampaignComponent,
    UrgentJointReliefCampaignInitialApproveTaskPopupComponent,
    UrgentJointReliefCampaignFinalApproveTaskPopupComponent,
    UrgentJointReliefCampaignOrganizationApproveTaskPopupComponent,
    InternalBankApprovalApproveTaskPopupComponent,
    SelectEmployeePopupComponent,
    TransferringIndividualFundsAbroadComponent,
    TransferFundsAbroadApproveTaskPopupComponent,
    SelectReceiverEntityPopupComponent,
    TransferFundsAbroadCompleteTaskPopupComponent,
    GeneralAssociationMeetingAttendanceComponent,
    ManageMembersComponent,
    SelectMemberPopupComponent,
    ManageInternalUsersComponent,
    GeneralAssociationMeetingCompleteTaskPopupComponent,
    GeneralAssociationMeetingApproveTaskPopupComponent,
    MeetingPointMembersCommentsPopupComponent,
    SpecificMemberCommentsAndNotesComponent
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    EServicesMainModule,
    CollectionModule
  ]
})
export class ProjectsModule {
}
