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
import {
  InterventionImplementingAgencyListComponent
} from '@modules/services/shared-services/components/intervention-implementing-agency-list/intervention-implementing-agency-list.component';
import {
  InterventionRegionListComponent
} from '@modules/services/shared-services/components/intervention-region-list/intervention-region-list.component';
import {
  InterventionFieldListComponent
} from '@modules/services/shared-services/components/intervention-field-list/intervention-field-list.component';
import { SelectTemplatePopupComponent } from '../shared-services/popups/select-template-popup/select-template-popup.component';


@NgModule({
  declarations: [
    ChooseTemplatePopupComponent,
    BankAccountComponent,
    WorkAreasComponent,
    RealBeneficiariesComponent,
    ApprovalFormComponent,
    InterventionImplementingAgencyListComponent,
    InterventionRegionListComponent,
    InterventionFieldListComponent,
    SelectTemplatePopupComponent
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
    ApprovalFormComponent,
    InterventionImplementingAgencyListComponent,
    InterventionRegionListComponent,
    InterventionFieldListComponent
  ]
})
export class SharedServicesModule { }
