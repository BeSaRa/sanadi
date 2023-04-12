import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {TransferringIndividualFundsAbroadRoutingModule} from './transferring-individual-funds-abroad-routing.module';
import {
  TransferringIndividualFundsAbroadOutputsComponent
} from './pages/transferring-individual-funds-abroad-outputs/transferring-individual-funds-abroad-outputs.component';
import {
  TransferringIndividualFundsAbroadComponent
} from '@modules/services/transferring-individual-funds-abroad/pages/transferring-individual-funds-abroad/transferring-individual-funds-abroad.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  TransferFundsAbroadApproveTaskPopupComponent
} from '@modules/services/transferring-individual-funds-abroad/popups/transfer-funds-abroad-approve-task-popup/transfer-funds-abroad-approve-task-popup.component';
import {
  SelectReceiverEntityPopupComponent
} from '@modules/services/transferring-individual-funds-abroad/popups/select-receiver-entity-popup/select-receiver-entity-popup.component';
import {
  TransferFundsAbroadCompleteTaskPopupComponent
} from '@modules/services/transferring-individual-funds-abroad/popups/transfer-funds-abroad-complete-task-popup/transfer-funds-abroad-complete-task-popup.component';
import { TIFAExecutiveManagementPopupComponent } from './popups/TIFA-executive-management-popup/TIFA-executive-management-popup.component';
import { TIFAPurposePopupComponent } from './popups/TIFB-purpose-popup/TIFA-purpose-popup.component';
import { TIFAPaymentPopupComponent } from './popups/TIFA-payment-popup/TIFA-payment-popup.component';
import { AuditTransferringIndividualFundsAbroadComponent } from './audit/audit-transferring-individual-funds-abroad/audit-transferring-individual-funds-abroad.component';
import { AuditTransferFundsExecutiveManagementComponent } from './audit/audit-transfer-funds-executive-management/audit-transfer-funds-executive-management.component';
import { AuditTransferPurposeComponent } from './audit/audit-transfer-purpose/audit-transfer-purpose.component';
import { SharedServicesModule } from '../shared-services/shared-services.module';


@NgModule({
  declarations: [
    TransferringIndividualFundsAbroadComponent,
    TIFAExecutiveManagementPopupComponent,
    TIFAPurposePopupComponent,
    TIFAPaymentPopupComponent,
    TransferringIndividualFundsAbroadOutputsComponent,
    TransferFundsAbroadApproveTaskPopupComponent,
    SelectReceiverEntityPopupComponent,
    TransferFundsAbroadCompleteTaskPopupComponent,
    AuditTransferringIndividualFundsAbroadComponent,
    AuditTransferFundsExecutiveManagementComponent,
    AuditTransferPurposeComponent
  ],
  imports: [
    CommonModule,
    SharedServicesModule,
    EServicesMainModule,
    TransferringIndividualFundsAbroadRoutingModule
  ]
})
export class TransferringIndividualFundsAbroadModule { }
