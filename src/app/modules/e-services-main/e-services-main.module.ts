import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import { SelectLicensePopupComponent } from '@app/modules/e-services-main/popups/select-license-popup/select-license-popup.component';
import {
  FilterInboxRequestPopupComponent
} from '@app/modules/e-services-main/popups/filter-inbox-request-popup/filter-inbox-request-popup.component';
import { SelectTemplatePopupComponent } from '@app/modules/e-services-main/popups/select-template-popup/select-template-popup.component';
import { SelectedLicenseTableComponent } from '@app/modules/e-services-main/shared/selected-license-table/selected-license-table.component';
import { BankAccountComponent } from './shared/bank-account/bank-account.component';
import { ExecutiveManagementComponent } from './shared/executive-management/executive-management.component';
import { EmployeeFormPopupComponent } from '@app/modules/e-services-main/popups/employee-form-popup/employee-form-popup.component';
import { EmployeesDataComponent } from './shared/employees-data/employees-data.component';
import { ProjectNeedsComponent } from './shared/project-needs/project-needs.component';

@NgModule({
  declarations: [
    SelectLicensePopupComponent,
    FilterInboxRequestPopupComponent,
    SelectedLicenseTableComponent,
    SelectedLicenseTableComponent,
    SelectTemplatePopupComponent,
    SelectedLicenseTableComponent,
    BankAccountComponent,
    ExecutiveManagementComponent,
    EmployeesDataComponent,
    EmployeeFormPopupComponent,
    ProjectNeedsComponent
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
    EmployeeFormPopupComponent,
    EmployeesDataComponent,
    ProjectNeedsComponent
  ]
})
export class EServicesMainModule {
}
