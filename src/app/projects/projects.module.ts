import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProjectsRoutingModule} from './projects-routing.module';
import {ProjectsComponent} from './projects.component';
import {SharedModule} from "@app/shared/shared.module";
import {ProjectModelComponent} from './pages/project-model/project-model.component';
import {InternalProjectLicenseComponent} from './pages/internal-project-license/internal-project-license.component';
import {
  UrgentInterventionLicenseComponent
} from './pages/urgent-intervention-license/urgent-intervention-license.component';
import {
  UrgentInterventionApproveTaskPopupComponent
} from "@app/projects/popups/urgent-intervention-approve-task-popup/urgent-intervention-approve-task-popup.component";
import { InternalBankAccountApprovalComponent } from './pages/internal-bank-account-approval/internal-bank-account-approval.component';
import { InternalBankApprovalApproveTaskPopupComponent } from './popups/internal-bank-approval-approve-task-popup/internal-bank-approval-approve-task-popup.component';
import {CollectionModule} from '@app/modules/collection/collection.module';
import { UrgentJointReliefCampaignComponent } from './pages/urgent-joint-relief-campaign/urgent-joint-relief-campaign.component';
import { UrgentJointReliefCampaignInitialApproveTaskPopupComponent } from './popups/urgent-joint-relief-campaign-initial-approve-task-popup/urgent-joint-relief-campaign-initial-approve-task-popup.component';
import { UrgentJointReliefCampaignFinalApproveTaskPopupComponent } from './popups/urgent-joint-relief-campaign-final-approve-task-popup/urgent-joint-relief-campaign-final-approve-task-popup.component';
import { UrgentJointReliefCampaignOrganizationApproveTaskPopupComponent } from '../projects/popups/urgent-joint-relief-campaign-organization-approve-task-popup/urgent-joint-relief-campaign-organization-approve-task-popup.component';


@NgModule({
  declarations: [
    ProjectsComponent,
    ProjectModelComponent,
    InternalProjectLicenseComponent,
    UrgentInterventionLicenseComponent,
    UrgentInterventionApproveTaskPopupComponent,
    InternalBankAccountApprovalComponent,
    InternalBankApprovalApproveTaskPopupComponent,
    UrgentJointReliefCampaignComponent,
    UrgentJointReliefCampaignInitialApproveTaskPopupComponent,
    UrgentJointReliefCampaignFinalApproveTaskPopupComponent,
    UrgentJointReliefCampaignOrganizationApproveTaskPopupComponent
  ],
    imports: [
        CommonModule,
        ProjectsRoutingModule,
        SharedModule,
        CollectionModule
    ]
})
export class ProjectsModule {
}
