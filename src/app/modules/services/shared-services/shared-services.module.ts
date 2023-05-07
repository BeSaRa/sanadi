import { SelectCustomServiceTemplatePopupComponent } from './popups/select-custom-service-template-popup/select-custom-service-template-popup.component';
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
import { ReadBenefucuariesPopupComponent } from './popups/read-benefucuaries-popup/read-benefucuaries-popup.component';
import { WorkAreasPopupComponent } from './popups/work-areas-popup/work-areas-popup.component';
import { BankAccountPopupComponent } from './popups/bank-account-popup/bank-account-popup.component';
import { InterventionImplementingAgencyListPopupComponent } from './popups/intervention-implementing-agency-list-popup/intervention-implementing-agency-list-popup.component';
import { InterventionRegionListPopupComponent } from './popups/intervention-region-list-popup/intervention-region-list-popup.component';
import { InterventionFieldListPopupComponent } from './popups/intervention-field-list-popup/intervention-field-list-popup.component';


@NgModule({
  declarations: [
    ChooseTemplatePopupComponent,
    BankAccountComponent,
    WorkAreasComponent,
    WorkAreasPopupComponent,
    RealBeneficiariesComponent,
    ReadBenefucuariesPopupComponent,
    ApprovalFormComponent,
    InterventionImplementingAgencyListComponent,
    InterventionImplementingAgencyListPopupComponent,
    InterventionRegionListComponent,
    InterventionRegionListPopupComponent,
    InterventionFieldListComponent,
    InterventionFieldListPopupComponent,
    BankAccountPopupComponent,
    SelectCustomServiceTemplatePopupComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule
  ],
  exports: [
    ChooseTemplatePopupComponent,
    BankAccountComponent,
    WorkAreasComponent,
    WorkAreasPopupComponent,
    RealBeneficiariesComponent,
    ReadBenefucuariesPopupComponent,
    ApprovalFormComponent,
    InterventionImplementingAgencyListComponent,
    InterventionRegionListComponent,
    InterventionFieldListComponent
  ]
})
export class SharedServicesModule { }
