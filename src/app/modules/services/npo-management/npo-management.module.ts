import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NpoManagementRoutingModule } from './npo-management-routing.module';
import { NpoManagementOutputsComponent } from './pages/npo-management-outputs/npo-management-outputs.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {NpoManagementComponent} from '@modules/services/npo-management/pages/npo-management/npo-management.component';
import {
  FounderMembersComponent
} from '@modules/services/npo-management/pages/npo-management/founder-members/founder-members.component';
import {
  NpoBankAccountComponent
} from '@modules/services/npo-management/pages/npo-management/npo-bank-account/npo-bank-account.component';
import {
  NpoContactOfficerComponent
} from '@modules/services/npo-management/pages/npo-management/npo-contact-officer/npo-contact-officer.component';
import {
  NpoManagementApprovePopupComponent
} from '@modules/services/npo-management/popups/npo-management-approve-popup/npo-management-approve-popup.component';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';
import { NpoContactOfficerPopupComponent } from './popups/npo-contact-officer-popup/npo-contact-officer-popup.component';
import { FounderMembersPopupComponent } from './popups/founder-members-popup/founder-members-popup.component';
import { NpoBankAccountPopupComponent } from './popups/npo-bank-account-popup/npo-bank-account-popup.component';


@NgModule({
  declarations: [
    NpoManagementComponent,
    NpoManagementOutputsComponent,
    FounderMembersComponent,
    NpoBankAccountComponent,
    NpoContactOfficerComponent,
    NpoContactOfficerPopupComponent,
    NpoManagementApprovePopupComponent,
    FounderMembersPopupComponent,
    NpoBankAccountPopupComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    NpoManagementRoutingModule
  ]
})
export class NpoManagementModule { }
