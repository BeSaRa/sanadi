import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomsExemptionRemittanceRoutingModule } from './customs-exemption-remittance-routing.module';
import { CustomsExemptionOutputsComponent } from './pages/customs-exemption-outputs/customs-exemption-outputs.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  CustomsExemptionComponent
} from '@modules/services/customs-exemption-remittance/pages/customs-exemption/customs-exemption.component';
import {
  CustomsExemptionApproveTaskPopupComponent
} from '@modules/services/customs-exemption-remittance/popups/customs-exemption-approve-task-popup/customs-exemption-approve-task-popup.component';
import {
  SelectDocumentPopUpComponent
} from '@modules/services/customs-exemption-remittance/popups/select-document-pop-up/select-document-pop-up.component';
import { AuditCustomsExemptionComponent } from './audit/audit-customs-exemption/audit-customs-exemption.component';


@NgModule({
  declarations: [
    CustomsExemptionComponent,
    CustomsExemptionOutputsComponent,
    CustomsExemptionApproveTaskPopupComponent,
    SelectDocumentPopUpComponent,
    AuditCustomsExemptionComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    CustomsExemptionRemittanceRoutingModule
  ]
})
export class CustomsExemptionRemittanceModule { }
