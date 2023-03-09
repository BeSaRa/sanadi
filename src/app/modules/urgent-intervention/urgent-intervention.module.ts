import {
  UrgentInterventionFinancialNotificationComponent
} from './pages/urgent-intervention-financial-notification/urgent-intervention-financial-notification.component';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UrgentInterventionRoutingModule} from './urgent-intervention-routing.module';
import {UrgentInterventionComponent} from './urgent-intervention.component';
import {EServicesMainModule} from '@app/modules/e-services-main/e-services-main.module';
import {
  UrgentInterventionClosureComponent
} from './pages/urgent-intervention-closure/urgent-intervention-closure.component';
import {StageListComponent} from './shared/stage-list/stage-list.component';
import {ResultListComponent} from './shared/result-list/result-list.component';
import {
  ImplementationEvaluationListComponent
} from './shared/implementation-evaluation-list/implementation-evaluation-list.component';
import {BestPracticesListComponent} from './shared/best-practices-list/best-practices-list.component';
import {LessonsLearntListComponent} from './shared/lessons-learnt-list/lessons-learnt-list.component';
import {
  UrgentInterventionClosureApproveTaskPopupComponent
} from './popups/urgent-intervention-closure-approve-task-popup/urgent-intervention-closure-approve-task-popup.component';
import {
  UrgentInterventionLicenseFollowupComponent
} from './pages/urgent-intervention-license-followup/urgent-intervention-license-followup.component';
import {
  UrgentInterventionReportListComponent
} from './shared/urgent-intervention-report-list/urgent-intervention-report-list.component';
import {
  UrgentInterventionReportPopupComponent
} from './popups/urgent-intervention-report-popup/urgent-intervention-report-popup.component';
import {
  UrgentInterventionAttachmentPopupComponent
} from './popups/urgent-intervention-attachment-popup/urgent-intervention-attachment-popup.component';
import {
  UrgentInterventionAttachmentApprovalPopupComponent
} from './popups/urgent-intervention-attachment-approval-popup/urgent-intervention-attachment-approval-popup.component';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';


@NgModule({
  declarations: [
    UrgentInterventionComponent,
    UrgentInterventionFinancialNotificationComponent,
    UrgentInterventionClosureComponent,
    StageListComponent,
    ResultListComponent,
    ImplementationEvaluationListComponent,
    BestPracticesListComponent,
    LessonsLearntListComponent,
    UrgentInterventionClosureApproveTaskPopupComponent,
    UrgentInterventionLicenseFollowupComponent,
    UrgentInterventionReportListComponent,
    UrgentInterventionReportPopupComponent,
    UrgentInterventionAttachmentPopupComponent,
    UrgentInterventionAttachmentApprovalPopupComponent
  ],
  exports: [],
  imports: [
    CommonModule,
    UrgentInterventionRoutingModule,
    EServicesMainModule,
    SharedServicesModule
  ]
})
export class UrgentInterventionModule {
}
