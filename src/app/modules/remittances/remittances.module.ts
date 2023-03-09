import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RemittancesRoutingModule} from './remittances-routing.module';
import {RemittanceComponent} from './remittance.component';
import {EServicesMainModule} from '@app/modules/e-services-main/e-services-main.module';
import {
  FinancialTransferLicensingApprovePopupComponent
} from '@app/modules/remittances/popups/financial-transfer-licensing-approve-popup/financial-transfer-licensing-approve-popup.component';
import {
  FinancialTransfersLicensingComponent
} from '@app/modules/remittances/pages/financial-transfers-licensing/financial-transfers-licensing.component';
import {
  FinancialTransfersProjectsComponent
} from './shared/financial-transfers-projects/financial-transfers-projects.component';

@NgModule({
  declarations: [
    RemittanceComponent,
    FinancialTransfersLicensingComponent,
    FinancialTransfersProjectsComponent,
    FinancialTransferLicensingApprovePopupComponent,
  ],
  imports: [CommonModule, RemittancesRoutingModule, EServicesMainModule],
})
export class RemittancesModule {}
