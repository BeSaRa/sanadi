import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { BannedPersonApproveRequestsComponent } from './pages/banned-person-approve-requests/banned-person-approve-requests.component';
import { BannedPersonDraftComponent } from './pages/banned-person-draft/banned-person-draft.component';
import { BannedPersonReturnedRequestsComponent } from './pages/banned-person-returned-requests/banned-person-returned-requests.component';
import { BannedPersonSearchComponent } from './pages/banned-person-search/banned-person-search.component';
import { CommissionDatabaseComponent } from './pages/commission-database/commission-database.component';
import { ScreeningSearchAuditComponent } from './pages/screening-search-audit/screening-search-audit.component';
import { TerrorismMoiComponent } from './pages/terrorism-moi/terrorism-moi.component';
import { WorldCheckSerachComponent } from './pages/world-check-search/world-check-search.component';
import { BannedPersonAuditPopupComponent } from './popups/banned-person-audit-popup/banned-person-audit-popup.component';
import { BannedPersonPopupComponent } from './popups/banned-person-popup/banned-person-popup.component';
import { MakeDecisionComponent } from './popups/make-decision/make-decision.component';
import { SelectBannedPersonPopupComponent } from './popups/select-banned-person-popup/select-banned-person-popup.component';
import { WorldCheckSearchResultPopupComponent } from './popups/world-check-search-result-popup/world-check-search-result-popup.component';
import { RestrictedRoutingModule } from './restricted-routing.module';
import { RestrictedComponent } from './restricted.component';
import { BannedPersonInquiryFormComponent } from './shared/banned-person-inquiry-form/banned-person-inquiry-form.component';
import { BannedPersonRequestFormComponent } from './shared/banned-person-request-form/banned-person-request-form.component';
import { BannedPersonSearchFormComponent } from './shared/banned-person-search-form/banned-person-search-form.component';
import { BannedPersonTableComponent } from './shared/banned-person-table/banned-person-table.component';
import { BannedPersonTerrorismTableComponent } from './shared/banned-person-terrorism-table/banned-person-terrorism-table.component';

@NgModule({
  imports: [
    CommonModule,
    RestrictedRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [
    RestrictedComponent,
    WorldCheckSerachComponent,
    ScreeningSearchAuditComponent,
    WorldCheckSearchResultPopupComponent,
    MakeDecisionComponent,
    CommissionDatabaseComponent,
    BannedPersonPopupComponent,
    BannedPersonTableComponent,
    TerrorismMoiComponent,
    BannedPersonDraftComponent,
    BannedPersonReturnedRequestsComponent,
    BannedPersonApproveRequestsComponent,
    BannedPersonRequestFormComponent,
    BannedPersonAuditPopupComponent,
    SelectBannedPersonPopupComponent,
    BannedPersonTerrorismTableComponent,
    BannedPersonInquiryFormComponent,
    BannedPersonSearchFormComponent,
    BannedPersonSearchComponent
  ]
})
export class RestrictedModule { }
