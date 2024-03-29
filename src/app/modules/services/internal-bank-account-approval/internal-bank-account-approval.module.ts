import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {InternalBankAccountApprovalRoutingModule} from './internal-bank-account-approval-routing.module';
import {
  InternalBankAccountApprovalOutputsComponent
} from './pages/internal-bank-account-approval-outputs/internal-bank-account-approval-outputs.component';
import {
  InternalBankAccountApprovalComponent
} from '@modules/services/internal-bank-account-approval/pages/internal-bank-account-approval/internal-bank-account-approval.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  InternalBankApprovalApproveTaskPopupComponent
} from '@modules/services/internal-bank-account-approval/popups/internal-bank-approval-approve-task-popup/internal-bank-approval-approve-task-popup.component';
import {
  SelectEmployeePopupComponent
} from '@modules/services/internal-bank-account-approval/popups/select-employee-popup/select-employee-popup.component';
import { AuditInternalBankAccountApprovalComponent } from './audit/audit-internal-bank-account-approval/audit-internal-bank-account-approval.component';


@NgModule({
  declarations: [
    InternalBankAccountApprovalComponent,
    InternalBankAccountApprovalOutputsComponent,
    InternalBankApprovalApproveTaskPopupComponent,
    SelectEmployeePopupComponent,
    AuditInternalBankAccountApprovalComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    InternalBankAccountApprovalRoutingModule
  ]
})
export class InternalBankAccountApprovalModule {
}
