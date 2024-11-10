import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EServicesMainModule } from '@app/modules/e-services-main/e-services-main.module';
import { SharedServicesModule } from '../shared-services/shared-services.module';
import { PenaltiesAndViolationsComponent } from './pages/penalties-and-violations/penalties-and-violations.component';
import { PenaltiesAndViolationsRoutingModule } from './penalties-and-violations-routing.module';
import { ExternalEntityPopupComponent } from './popups/external-entity-popup/external-entity-popup.component';
import { IncidenceReportPopupComponent } from './popups/incidence-report-popup/incidence-report-popup.component';
import { LegalActionsPopupComponent } from './popups/legal-actions-popup/legal-actions-popup.component';
import { ExternalEntitiesComponent } from './shared/external-entities/external-entities.component';
import { IncidentElementsComponent } from './shared/incident-elements/incident-elements.component';
import { IncidentReportsComponent } from './shared/incident-reports/incident-reports.component';
import { LegalActionsComponent } from './shared/legal-actions/legal-actions.component';
import { PenaltyLegalBasisComponent } from './shared/penalty-legal-basis/penalty-legal-basis.component';
import { PenaltyLegalBasisPopupComponent } from './popups/penalty-legal-basis-popup/penalty-legal-basis-popup.component';
import { ProposedSanctionsComponent } from './shared/proposed-sanctions/proposed-sanctions.component';
import { ProposedSanctionsPopupComponent } from './popups/proposed-sanctions-popup/proposed-sanctions-popup.component';
import { PenaltyViolationLogsComponent } from './penalty-violation-logs/penalty-violation-logs.component';



@NgModule({
  declarations: [
    PenaltiesAndViolationsComponent,
    ExternalEntitiesComponent,
    ExternalEntityPopupComponent,
    IncidentElementsComponent,
    IncidentReportsComponent,
    IncidenceReportPopupComponent,
    PenaltyLegalBasisComponent,
    PenaltyLegalBasisPopupComponent,
    LegalActionsComponent,
    LegalActionsPopupComponent,
    ProposedSanctionsComponent,
    ProposedSanctionsPopupComponent,
    PenaltyViolationLogsComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    PenaltiesAndViolationsRoutingModule
  ]
})
export class PenaltiesAndViolationsModule { }
