import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationEntitiesSupportRoutingModule } from './organization-entities-support-routing.module';
import { OrganizationEntitiesSupportOutputsComponent } from './pages/organization-entities-support-outputs/organization-entities-support-outputs.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  OrganizationsEntitiesSupportComponent
} from '@modules/services/organization-entities-support/pages/organizations-entities-support/organizations-entities-support.component';
import {
  OrganizationsEntitiesSupportPopupComponent
} from '@modules/services/organization-entities-support/popups/organizations-entities-support-popup/organizations-entities-support-popup.component';
import { AuditOrganizationsEntitiesSupportComponent } from './audit/audit-organizations-entities-support/audit-organizations-entities-support.component';


@NgModule({
  declarations: [
    OrganizationsEntitiesSupportComponent,
    OrganizationEntitiesSupportOutputsComponent,
    OrganizationsEntitiesSupportPopupComponent,
    AuditOrganizationsEntitiesSupportComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    OrganizationEntitiesSupportRoutingModule
  ]
})
export class OrganizationEntitiesSupportModule { }
