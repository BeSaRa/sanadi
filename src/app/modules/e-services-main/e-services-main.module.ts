import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '@app/shared/shared.module';
import {SelectLicensePopupComponent} from '@app/modules/e-services-main/popups/select-license-popup/select-license-popup.component';
import {
  FilterInboxRequestPopupComponent
} from '@app/modules/e-services-main/popups/filter-inbox-request-popup/filter-inbox-request-popup.component';
import {SelectTemplatePopupComponent} from '@app/modules/e-services-main/popups/select-template-popup/select-template-popup.component';
import {SelectedLicenseTableComponent} from '@app/modules/e-services-main/shared/selected-license-table/selected-license-table.component';
import { EmployeeFormPopupComponent } from '@app/modules/e-services-main/popups/employee-form-popup/employee-form-popup.component';
import { EmployeesDataComponent } from './shared/employees-data/employees-data.component';

@NgModule({
  declarations: [
    SelectLicensePopupComponent,
    FilterInboxRequestPopupComponent,
    SelectedLicenseTableComponent,
    SelectedLicenseTableComponent,
    SelectTemplatePopupComponent,
    EmployeesDataComponent,
    EmployeeFormPopupComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    SharedModule,
    SelectedLicenseTableComponent,
    EmployeeFormPopupComponent,
    EmployeesDataComponent
  ]
})
export class EServicesMainModule {
}
