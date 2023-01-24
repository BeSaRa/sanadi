import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProjectsRoutingModule} from './projects-routing.module';
import {ProjectsComponent} from './projects.component';
import {ProjectModelComponent} from './pages/project-model/project-model.component';
import {InternalProjectLicenseComponent} from './pages/internal-project-license/internal-project-license.component';
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
import {ProjectFundraisingComponent} from './pages/project-fundraising/project-fundraising.component';
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
import {ChooseTemplatePopupComponent} from './popups/choose-template-popup/choose-template-popup.component';
import {
  DeductionRatioManagerComponent
} from './pages/project-fundraising/components/deduction-ratio-manager/deduction-ratio-manager.component';
import {
  TargetedCountriesDistributionComponent
} from './pages/project-fundraising/components/targeted-countries-distribution/targeted-countries-distribution.component';
import {
  TargetedYearsDistributionComponent
} from './pages/project-fundraising/components/targeted-years-distribution/targeted-years-distribution.component';
import {
  ProjectFundraisingApproveTaskPopupComponent
} from './popups/project-fundraising-approve-task-popup/project-fundraising-approve-task-popup.component';
import {
  ProjectImplementationComponent
} from '@modules/projects/pages/project-implementation/project-implementation.component';
import {
  ProjectImplementationApproveTaskPopupComponent
} from '@modules/projects/popups/project-implementation-approve-task-popup/project-implementation-approve-task-popup.component';
import {
  ImplementationTemplateComponent
} from './pages/project-implementation/components/implementation-template/implementation-template.component';
import { ImplementationTemplatePopupComponent } from './popups/implementation-template-popup/implementation-template-popup.component';
import { ImplementingAgencyListComponent } from './pages/project-implementation/components/implementing-agency-list/implementing-agency-list.component';
import { ImplementationFundraisingComponent } from './pages/project-implementation/components/implementation-fundraising/implementation-fundraising.component';
import { SelectProjectFundraisingPopupComponent } from './popups/select-project-fundraising-popup/select-project-fundraising-popup.component';


@NgModule({
  declarations: [
    ProjectsComponent,
    ProjectModelComponent,
    InternalProjectLicenseComponent,
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
    SpecificMemberCommentsAndNotesComponent,
    ProjectFundraisingComponent,
    ChooseTemplatePopupComponent,
    DeductionRatioManagerComponent,
    TargetedCountriesDistributionComponent,
    TargetedYearsDistributionComponent,
    ProjectFundraisingApproveTaskPopupComponent,
    ProjectImplementationComponent,
    ProjectImplementationApproveTaskPopupComponent,
    ImplementationTemplateComponent,
    ImplementationTemplatePopupComponent,
    ImplementingAgencyListComponent,
    ImplementationFundraisingComponent,
    SelectProjectFundraisingPopupComponent,
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
