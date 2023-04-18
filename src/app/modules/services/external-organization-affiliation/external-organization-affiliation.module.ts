import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ExternalOrganizationAffiliationRoutingModule} from './external-organization-affiliation-routing.module';
import {
  ExternalOrgAffiliationOutputsComponent
} from './pages/external-org-affiliation-outputs/external-org-affiliation-outputs.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  ExternalOrgAffiliationComponent
} from '@modules/services/external-organization-affiliation/pages/external-org-affiliation/external-org-affiliation.component';
import {
  ExternalOrgAffiliationApprovePopupComponent
} from '@modules/services/external-organization-affiliation/popups/external-org-affiliation-approve-popup/external-org-affiliation-approve-popup.component';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';
import { AuditExternalOrganizationAffiliationComponent } from './audit/audit-external-organization-affiliation/audit-external-organization-affiliation.component';


@NgModule({
  declarations: [
    ExternalOrgAffiliationComponent,
    ExternalOrgAffiliationOutputsComponent,
    ExternalOrgAffiliationApprovePopupComponent,
    AuditExternalOrganizationAffiliationComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    ExternalOrganizationAffiliationRoutingModule
  ]
})
export class ExternalOrganizationAffiliationModule { }
