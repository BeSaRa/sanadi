import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectImplementationRoutingModule } from './project-implementation-routing.module';
import { ProjectImplementationOutputsComponent } from './pages/project-implementation-outputs/project-implementation-outputs.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  ProjectImplementationComponent
} from '@modules/services/project-implementation/pages/project-implementation/project-implementation.component';
import {
  FundSourceComponent
} from '@modules/services/project-implementation/pages/project-implementation/components/fund-source/fund-source.component';
import {PaymentsComponent} from '@modules/services/project-implementation/pages/project-implementation/components/payments/payments.component';
import {
  ImplementationFundraisingComponent
} from '@modules/services/project-implementation/pages/project-implementation/components/implementation-fundraising/implementation-fundraising.component';
import {
  ImplementationTemplateComponent
} from '@modules/services/project-implementation/pages/project-implementation/components/implementation-template/implementation-template.component';
import {
  ImplementingAgencyListComponent
} from '@modules/services/project-implementation/pages/project-implementation/components/implementing-agency-list/implementing-agency-list.component';
import {
  FundSourcePopupComponent
} from '@modules/services/project-implementation/popups/fund-source-popup/fund-source-popup.component';
import {
  PaymentPopupComponent
} from '@modules/services/project-implementation/popups/payment-popup/payment-popup.component';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';
import {
  ImplementationTemplatePopupComponent
} from '@modules/services/project-implementation/popups/implementation-template-popup/implementation-template-popup.component';
import {MapsModule} from '@modules/maps/maps.module';
import {
  ProjectImplementationApproveTaskPopupComponent
} from '@modules/services/project-implementation/popups/project-implementation-approve-task-popup/project-implementation-approve-task-popup.component';
import {
  SelectProjectFundraisingPopupComponent
} from '@modules/services/project-implementation/popups/select-project-fundraising-popup/select-project-fundraising-popup.component';
import { AuditProjectImplementationComponent } from './audit/audit-project-implementation/audit-project-implementation.component';
import { AuditFundSourceComponent } from './audit/audit-fund-source/audit-fund-source.component';
import { AuditImplementationFundraisingComponent } from './audit/audit-implementation-fundraising/audit-implementation-fundraising.component';
import { AuditImplementationTemplateComponent } from './audit/audit-implementation-template/audit-implementation-template.component';


@NgModule({
  declarations: [
    ProjectImplementationComponent,
    ProjectImplementationOutputsComponent,
    FundSourceComponent,
    PaymentsComponent,
    ImplementationFundraisingComponent,
    ImplementationTemplateComponent,
    ImplementingAgencyListComponent,
    FundSourcePopupComponent,
    PaymentPopupComponent,
    ImplementationTemplatePopupComponent,
    SelectProjectFundraisingPopupComponent,
    ProjectImplementationApproveTaskPopupComponent,
    AuditProjectImplementationComponent,
    AuditFundSourceComponent,
    AuditImplementationFundraisingComponent,
    AuditImplementationTemplateComponent
  ],
  imports: [
    CommonModule,
    SharedServicesModule,
    EServicesMainModule,
    MapsModule,
    ProjectImplementationRoutingModule
  ]
})
export class ProjectImplementationModule { }
