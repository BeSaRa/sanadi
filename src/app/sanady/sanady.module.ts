import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SanadyRoutingModule} from './sanady-routing.module';
import {SanadyComponent} from './sanady.component';
import {SharedModule} from '../shared/shared.module';
import {UserRequestComponent} from './pages/user-request/user-request.component';
import {SubventionLogPopupComponent} from './popups/subvention-log-popup/subvention-log-popup.component';
import {SelectBeneficiaryPopupComponent} from './popups/select-beneficiary-popup/select-beneficiary-popup.component';
import {UserRequestSearchComponent} from './pages/user-request-search/user-request-search.component';
import {UserInquiryComponent} from './pages/user-inquiry/user-inquiry.component';
import {RequestsUnderProcessComponent} from './pages/requests-under-process/requests-under-process.component';
import {ReasonPopupComponent} from './popups/reason-popup/reason-popup.component';
import {PartialRequestComponent} from './pages/partial-requests/partial-request/partial-request.component';
import {RequestDetailsPopupComponent} from './popups/request-details-popup/request-details-popup.component';
import {FilterRequestPopupComponent} from './popups/filter-request-popup/filter-request-popup.component';
import {PartialRequestReportsComponent} from './pages/partial-request-reports/partial-request-reports.component';
import {SubventionAidPopupComponent} from './popups/subvention-aid-popup/subvention-aid-popup.component';
import {AuditDetailsPopupComponent} from './popups/audit-details-popup/audit-details-popup.component';
import {BeneficiaryObligationComponent} from './shared/beneficiary-obligation/beneficiary-obligation.component';
import {BeneficiaryIncomeComponent} from './shared/beneficiary-income/beneficiary-income.component';
import {InquiryLogsComponent} from './pages/inquiry-logs/inquiry-logs.component';
import {AidListComponent} from './shared/aid-list/aid-list.component';
import {GdxIntegrationModule} from '@app/modules/gdx-integration/gdx-integration.module';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import {
  BeneficiaryFamilyMemberComponent,
} from '@app/sanady/shared/beneficiary-family-members/beneficiary-family-members.component';
import { QcbFilesPopupComponent } from '@app/sanady/popups/qcb-files-popup/qcb-files-popup.component';
import {ConfirmNdaCasePopupComponent} from '@app/sanady/popups/confirm-nda-case-popup/confirm-nda-case-popup.component';


@NgModule({
  declarations: [
    SanadyComponent,
    UserRequestComponent,
    UserInquiryComponent,
    SelectBeneficiaryPopupComponent,
    UserRequestSearchComponent,
    SubventionLogPopupComponent,
    SubventionAidPopupComponent,
    RequestsUnderProcessComponent,
    ReasonPopupComponent,
    PartialRequestComponent,
    RequestDetailsPopupComponent,
    FilterRequestPopupComponent,
    PartialRequestReportsComponent,
    AuditDetailsPopupComponent,
    BeneficiaryObligationComponent,
    BeneficiaryIncomeComponent,
    InquiryLogsComponent,
    AidListComponent,
    BeneficiaryFamilyMemberComponent,
    QcbFilesPopupComponent,
    ConfirmNdaCasePopupComponent
  ],
  imports: [
    CommonModule,
    SanadyRoutingModule,
    SharedModule,
    GdxIntegrationModule,
    NgxMaskDirective,
    NgxMaskPipe,
  ]
})
export class SanadyModule {
}
