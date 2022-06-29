import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RemittancesRoutingModule} from './remittances-routing.module';
import {CustomsExemptionComponent} from './pages/customs-exemption/customs-exemption.component';
import {RemittanceComponent} from './remittance.component';
import {
  CustomsExemptionApproveTaskPopupComponent
} from './popups/customs-exemption-approve-task-popup/customs-exemption-approve-task-popup.component';
import {SelectDocumentPopUpComponent} from './popups/select-document-pop-up/select-document-pop-up.component';
import {EServicesMainModule} from '@app/modules/e-services-main/e-services-main.module';

@NgModule({
  declarations: [CustomsExemptionComponent, RemittanceComponent, CustomsExemptionApproveTaskPopupComponent, SelectDocumentPopUpComponent],
  imports: [CommonModule, RemittancesRoutingModule, EServicesMainModule]
})
export class RemittancesModule {}
