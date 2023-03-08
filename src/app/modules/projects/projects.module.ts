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
    TransferFundsAbroadCompleteTaskPopupComponent
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
