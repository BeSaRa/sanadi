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
import { SelectCustomServiceTemplatePopupComponent } from './popups/select-custom-service-template-popup/select-custom-service-template-popup.component';
import { BankAccountNewComponent } from './components/bank-account-new/bank-account-new.component';
import { BankAccountNewPopupComponent } from './popups/bank-account-new-popup/bank-account-new-popup.component';
import {AuditBankAccountComponent} from './audit/audit-bank-account/audit-bank-account.component';
import {AuditWorkAreasComponent} from './audit/audit-work-areas/audit-work-areas.component';
import { AuditExecutiveManagementComponent } from './audit/audit-executive-management/audit-executive-management.component';
import { AuditContactOfficersComponent } from './audit/audit-contact-officers/audit-contact-officers.component';
import { AuditBankBranchComponent } from './audit/audit-bank-branch/audit-bank-branch.component';
import { AuditInterventionImplementingAgencyListComponent } from './audit/audit-intervention-implementing-agency-list copy/audit-intervention-implementing-agency-list.component';
import { AuditInterventionFieldListComponent } from './audit/audit-intervention-field-list/audit-intervention-field-list.component';
import { AuditInterventionRegionListComponent } from './audit/audit-intervention-region-list/audit-intervention-region-list.component';


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
    SelectCustomServiceTemplatePopupComponent,
    BankAccountNewComponent,
    BankAccountNewPopupComponent,
    AuditBankAccountComponent,
    AuditWorkAreasComponent,
    AuditExecutiveManagementComponent,
    AuditContactOfficersComponent,
    AuditBankBranchComponent,
    AuditInterventionImplementingAgencyListComponent,
    AuditInterventionFieldListComponent,
    AuditInterventionRegionListComponent
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
    InterventionFieldListComponent,
    BankAccountNewComponent,
    AuditBankAccountComponent,
    AuditWorkAreasComponent,
    AuditExecutiveManagementComponent,
    AuditContactOfficersComponent,
    AuditBankBranchComponent,
    AuditInterventionImplementingAgencyListComponent,
    AuditInterventionFieldListComponent,
    AuditInterventionRegionListComponent
  ]
})
export class SharedServicesModule { }
