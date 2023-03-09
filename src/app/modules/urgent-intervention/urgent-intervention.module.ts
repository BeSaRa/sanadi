import {
  UrgentInterventionFinancialNotificationComponent
} from './pages/urgent-intervention-financial-notification/urgent-intervention-financial-notification.component';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UrgentInterventionRoutingModule} from './urgent-intervention-routing.module';
import {UrgentInterventionComponent} from './urgent-intervention.component';
import {
  UrgentInterventionAnnouncementComponent
} from '@app/modules/urgent-intervention/pages/urgent-intervention-announcement/urgent-intervention-announcement.component';
import {EServicesMainModule} from '@app/modules/e-services-main/e-services-main.module';
import {
  ImplementingAgencyListComponent
} from '@app/modules/urgent-intervention/shared/implementing-agency-list/implementing-agency-list.component';
import {
  InterventionRegionListComponent
} from '@app/modules/urgent-intervention/shared/intervention-region-list/intervention-region-list.component';
import {
  InterventionFieldListComponent
} from '@app/modules/urgent-intervention/shared/intervention-field-list/intervention-field-list.component';
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


@NgModule({
    declarations: [
        UrgentInterventionComponent,
        UrgentInterventionFinancialNotificationComponent,
        UrgentInterventionAnnouncementComponent,
        ImplementingAgencyListComponent,
        InterventionRegionListComponent,
        InterventionFieldListComponent,
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
    exports: [
        ImplementingAgencyListComponent
    ],
    imports: [
        CommonModule,
        UrgentInterventionRoutingModule,
        EServicesMainModule,
    ]
})
export class UrgentInterventionModule {
}
