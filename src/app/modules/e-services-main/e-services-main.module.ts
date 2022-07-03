import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '@app/shared/shared.module';
import {SelectLicensePopupComponent} from '@app/modules/e-services-main/popups/select-license-popup/select-license-popup.component';
import {
  FilterInboxRequestPopupComponent
} from '@app/modules/e-services-main/popups/filter-inbox-request-popup/filter-inbox-request-popup.component';
import {SelectTemplatePopupComponent} from '@app/modules/e-services-main/popups/select-template-popup/select-template-popup.component';
import {SelectedLicenseTableComponent} from '@app/modules/e-services-main/shared/selected-license-table/selected-license-table.component';
import { BankAccountComponent } from './shared/bank-account/bank-account.component';
import { ExecutiveManagementComponent } from './shared/executive-management/executive-management.component';


@NgModule({
  declarations: [
    SelectLicensePopupComponent,
    FilterInboxRequestPopupComponent,
    SelectTemplatePopupComponent,
    SelectedLicenseTableComponent,
    BankAccountComponent,
    ExecutiveManagementComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    SharedModule,
    SelectedLicenseTableComponent,
    BankAccountComponent,
    ExecutiveManagementComponent,
  ]
})
export class EServicesMainModule {
}
