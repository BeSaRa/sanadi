import { RestrictedComponent } from './restricted.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorldCheckSerachComponent } from './pages/world-check-search/world-check-search.component';
import { WorldCheckSearchResultPopupComponent } from './popups/world-check-search-result-popup/world-check-search-result-popup.component';
import { ScreeningSearchAuditComponent } from './pages/screening-search-audit/screening-search-audit.component';
import { RestrictedRoutingModule } from './restricted-routing.module';
import { MakeDecisionComponent } from './popups/make-decision/make-decision.component';

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
  ]
})
export class RestrictedModule { }
