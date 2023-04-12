import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinancialTransferLicensingRoutingModule } from './financial-transfer-licensing-routing.module';
import { FinancialTranferLicensingOutputsComponent } from './pages/financial-tranfer-licensing-outputs/financial-tranfer-licensing-outputs.component';
import {
  FinancialTransfersLicensingComponent
} from '@modules/services/financial-transfer-licensing/pages/financial-transfers-licensing/financial-transfers-licensing.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  FinancialTransferLicensingApprovePopupComponent
} from '@modules/services/financial-transfer-licensing/popups/financial-transfer-licensing-approve-popup/financial-transfer-licensing-approve-popup.component';
import {
  FinancialTransfersProjectsComponent
} from '@modules/services/financial-transfer-licensing/shared/financial-transfers-projects/financial-transfers-projects.component';
import {
  SelectPreRegisteredPopupComponent
} from '@modules/services/financial-transfer-licensing/popups/select-pre-registered-popup/select-pre-registered-popup.component';
import {
  SelectAuthorizedEntityPopupComponent
} from '@modules/services/financial-transfer-licensing/popups/select-authorized-entity-popup/select-authorized-entity-popup.component';
import { FinancialTransfersProjectsPopupComponent } from './shared/financial-transfers-projects/financial-transfers-projects-popup/financial-transfers-projects-popup.component';


@NgModule({
  declarations: [
    FinancialTransfersLicensingComponent,
    FinancialTranferLicensingOutputsComponent,
    FinancialTransferLicensingApprovePopupComponent,
    FinancialTransfersProjectsComponent,
    SelectPreRegisteredPopupComponent,
    SelectAuthorizedEntityPopupComponent,
    FinancialTransfersProjectsPopupComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    FinancialTransferLicensingRoutingModule
  ]
})
export class FinancialTransferLicensingModule { }
