import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UrgentJointReliefCampaignRoutingModule } from './urgent-joint-relief-campaign-routing.module';
import { UrgentJointReliefCampaignOutputsComponent } from './pages/urgent-joint-relief-campaign-outputs/urgent-joint-relief-campaign-outputs.component';
import {
  UrgentJointReliefCampaignComponent
} from '@modules/services/urgent-joint-relief-campaign/pages/urgent-joint-relief-campaign/urgent-joint-relief-campaign.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  UrgentJointReliefCampaignInitialApproveTaskPopupComponent
} from '@modules/services/urgent-joint-relief-campaign/popups/urgent-joint-relief-campaign-initial-approve-task-popup/urgent-joint-relief-campaign-initial-approve-task-popup.component';
import {
  UrgentJointReliefCampaignFinalApproveTaskPopupComponent
} from '@modules/services/urgent-joint-relief-campaign/popups/urgent-joint-relief-campaign-final-approve-task-popup/urgent-joint-relief-campaign-final-approve-task-popup.component';
import {
  UrgentJointReliefCampaignOrganizationApproveTaskPopupComponent
} from '@modules/services/urgent-joint-relief-campaign/popups/urgent-joint-relief-campaign-organization-approve-task-popup/urgent-joint-relief-campaign-organization-approve-task-popup.component';
import { UrgentJoinOrganizationOfficerComponent } from './shared/urgent-join-organization-officer/urgent-join-organization-officer.component';
import { UrgentJoinOrganizationOfficerPopupComponent } from './popups/urgent-join-organization-officer-popup/urgent-join-organization-officer-popup.component';
import { AuditUrgentJointReliefCampaignComponent } from './audit/audit-urgent-joint-relief-campaign/audit-urgent-joint-relief-campaign.component';
import { AuditParticipantOrganizationsComponent } from './audit/audit-participant-organizations/audit-participant-organizations.component';
import { AuditOrganizationOfficersComponent } from './audit/audit-organization-officers/audit-organization-officers.component';


@NgModule({
  declarations: [
    UrgentJointReliefCampaignComponent,
    UrgentJoinOrganizationOfficerComponent,
    UrgentJoinOrganizationOfficerPopupComponent,
    UrgentJointReliefCampaignOutputsComponent,
    UrgentJointReliefCampaignInitialApproveTaskPopupComponent,
    UrgentJointReliefCampaignFinalApproveTaskPopupComponent,
    UrgentJointReliefCampaignOrganizationApproveTaskPopupComponent,
    AuditUrgentJointReliefCampaignComponent,
    AuditParticipantOrganizationsComponent,
    AuditOrganizationOfficersComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    UrgentJointReliefCampaignRoutingModule
  ]
})
export class UrgentJointReliefCampaignModule { }
