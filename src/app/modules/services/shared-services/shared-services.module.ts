import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  ChooseTemplatePopupComponent
} from '@modules/services/shared-services/popups/choose-template-popup/choose-template-popup.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {BankAccountComponent} from '@modules/services/shared-services/components/bank-account/bank-account.component';
import {WorkAreasComponent} from '@modules/services/shared-services/components/work-areas/work-areas.component';
import {
  RealBeneficiariesComponent
} from '@modules/services/shared-services/components/real-beneficiaries/real-beneficiaries.component';
import {
  ApprovalFormComponent
} from '@modules/services/shared-services/components/approval-form/approval-form.component';


@NgModule({
  declarations: [
    ChooseTemplatePopupComponent,
    BankAccountComponent,
    WorkAreasComponent,
    RealBeneficiariesComponent,
    ApprovalFormComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule
  ],
  exports: [
    ChooseTemplatePopupComponent,
    BankAccountComponent,
    WorkAreasComponent,
    RealBeneficiariesComponent,
    ApprovalFormComponent
  ]
})
export class SharedServicesModule { }
