import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UrgentInterventionLicenseFollowupRoutingModule } from './urgent-intervention-license-followup-routing.module';
import { UrgentInterventionLicenseFollowupOutputsComponent } from './pages/urgent-intervention-license-followup-outputs/urgent-intervention-license-followup-outputs.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  UrgentInterventionLicenseFollowupComponent
} from '@modules/services/urgent-intervention-license-followup/pages/urgent-intervention-license-followup/urgent-intervention-license-followup.component';
import {
  UrgentInterventionReportListComponent
} from '@modules/services/urgent-intervention-license-followup/shared/urgent-intervention-report-list/urgent-intervention-report-list.component';
import {
  UrgentInterventionReportPopupComponent
} from '@modules/services/urgent-intervention-license-followup/popups/urgent-intervention-report-popup/urgent-intervention-report-popup.component';
import {
  UrgentInterventionReportAttachmentPopupComponent
} from '@modules/services/urgent-intervention-license-followup/popups/urgent-intervention-report-attachment-popup/urgent-intervention-report-attachment-popup.component';
import {
  UrgentInterventionReportAttachmentApprovalPopupComponent
} from '@modules/services/urgent-intervention-license-followup/popups/urgent-intervention-report-attachment-approval-popup/urgent-intervention-report-attachment-approval-popup.component';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';


@NgModule({
  declarations: [
    UrgentInterventionLicenseFollowupComponent,
    UrgentInterventionLicenseFollowupOutputsComponent,
    UrgentInterventionReportListComponent,
    UrgentInterventionReportPopupComponent,
    UrgentInterventionReportAttachmentPopupComponent,
    UrgentInterventionReportAttachmentApprovalPopupComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    UrgentInterventionLicenseFollowupRoutingModule
  ]
})
export class UrgentInterventionLicenseFollowupModule { }
