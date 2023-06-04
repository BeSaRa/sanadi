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
import {RealBeneficiariesPopupComponent} from '@modules/services/shared-services/popups/real-beneficiaries-popup/real-beneficiaries-popup.component';
import {WorkAreasPopupComponent} from './popups/work-areas-popup/work-areas-popup.component';
import {BankAccountPopupComponent} from './popups/bank-account-popup/bank-account-popup.component';
import {
  InterventionImplementingAgencyListPopupComponent
} from './popups/intervention-implementing-agency-list-popup/intervention-implementing-agency-list-popup.component';
import {
  InterventionRegionListPopupComponent
} from './popups/intervention-region-list-popup/intervention-region-list-popup.component';
import {
  InterventionFieldListPopupComponent
} from './popups/intervention-field-list-popup/intervention-field-list-popup.component';
import {
  SelectCustomServiceTemplatePopupComponent
} from './popups/select-custom-service-template-popup/select-custom-service-template-popup.component';
import {AuditBankAccountComponent} from './audit/audit-bank-account/audit-bank-account.component';
import {AuditWorkAreasComponent} from './audit/audit-work-areas/audit-work-areas.component';
import {
  AuditExecutiveManagementComponent
} from './audit/audit-executive-management/audit-executive-management.component';
import {AuditContactOfficersComponent} from './audit/audit-contact-officers/audit-contact-officers.component';
import {AuditBankBranchComponent} from './audit/audit-bank-branch/audit-bank-branch.component';
import {
  AuditOrganizationOfficerComponent
} from './audit/audit-organization-officer/audit-organization-officer.component';
import {AuditRealBeneficiaryComponent} from './audit/audit-real-beneficiary/audit-real-beneficiary.component';
import {
  AuditInterventionImplementingAgencyListComponent
} from './audit/audit-intervention-implementing-agency-list copy/audit-intervention-implementing-agency-list.component';
import {
  AuditInterventionFieldListComponent
} from './audit/audit-intervention-field-list/audit-intervention-field-list.component';
import {
  AuditInterventionRegionListComponent
} from './audit/audit-intervention-region-list/audit-intervention-region-list.component';
import {
  AuditPaymentComponent
} from '../transferring-individual-funds-abroad/audit/audit-payment/audit-payment.component';
import { AuditBestPracticesListComponent } from './audit/audit-best-practices-list/audit-best-practices-list.component';
import { BestPracticesListComponent } from './components/best-practices-list/best-practices-list.component';
import { BestPracticesPopupComponent } from './popups/best-practices-popup/best-practices-popup.component';
import { AuditLessonsLearntListComponent } from './audit/audit-lessons-learnt-list/audit-lessons-learnt-list.component';
import { LessonsLearntListComponent } from './components/lessons-learnt-list/lessons-learnt-list.component';
import { LessonsLearntPopupComponent } from './popups/lessons-learnt-popup/lessons-learnt-popup.component';


@NgModule({
  declarations: [
    ChooseTemplatePopupComponent,
    BankAccountComponent,
    WorkAreasComponent,
    WorkAreasPopupComponent,
    RealBeneficiariesComponent,
    RealBeneficiariesPopupComponent,
    ApprovalFormComponent,
    InterventionImplementingAgencyListComponent,
    InterventionImplementingAgencyListPopupComponent,
    InterventionRegionListComponent,
    InterventionRegionListPopupComponent,
    InterventionFieldListComponent,
    InterventionFieldListPopupComponent,
    BankAccountPopupComponent,
    SelectCustomServiceTemplatePopupComponent,
    AuditBankAccountComponent,
    AuditWorkAreasComponent,
    AuditExecutiveManagementComponent,
    AuditContactOfficersComponent,
    AuditBankBranchComponent,
    AuditOrganizationOfficerComponent,
    AuditRealBeneficiaryComponent,
    AuditInterventionImplementingAgencyListComponent,
    AuditInterventionFieldListComponent,
    AuditInterventionRegionListComponent,
    AuditPaymentComponent,

    AuditBestPracticesListComponent,
    BestPracticesListComponent,
    BestPracticesPopupComponent,

    AuditLessonsLearntListComponent,
    LessonsLearntListComponent,
    LessonsLearntPopupComponent,

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
    RealBeneficiariesPopupComponent,
    ApprovalFormComponent,
    InterventionImplementingAgencyListComponent,
    InterventionRegionListComponent,
    InterventionFieldListComponent,
    AuditBankAccountComponent,
    AuditWorkAreasComponent,
    AuditExecutiveManagementComponent,
    AuditContactOfficersComponent,
    AuditBankBranchComponent,
    AuditOrganizationOfficerComponent,
    AuditRealBeneficiaryComponent,
    AuditInterventionImplementingAgencyListComponent,
    AuditInterventionFieldListComponent,
    AuditInterventionRegionListComponent,
    AuditPaymentComponent,

    AuditBestPracticesListComponent,
    BestPracticesListComponent,
    BestPracticesPopupComponent,

    AuditLessonsLearntListComponent,
    LessonsLearntListComponent,
    LessonsLearntPopupComponent,

  ]
})
export class SharedServicesModule { }
