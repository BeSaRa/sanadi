import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {EmploymentRoutingModule} from './employment-routing.module';
import {EmploymentOutputsComponent} from './pages/employment-outputs/employment-outputs.component';
import {EmploymentComponent} from '@modules/services/employment/pages/employment/employment.component';
import {
  EmployeeFormPopupComponent
} from '@modules/services/employment/popups/employee-form-popup/employee-form-popup.component';
import {EmployeesDataComponent} from '@modules/services/employment/shared/employees-data/employees-data.component';
import {
  EmploymentApproveComponent
} from '@modules/services/employment/popups/employment-approve/employment-approve.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import { AuditEmploymentComponent } from './audit/audit-employment/audit-employment.component';
import { AuditEmployeeComponent } from './audit/audit-employee/audit-employee.component';


@NgModule({
  declarations: [
    EmploymentComponent,
    EmploymentOutputsComponent,
    EmployeeFormPopupComponent,
    EmployeesDataComponent,
    EmploymentApproveComponent,
    AuditEmploymentComponent,
    AuditEmployeeComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    EmploymentRoutingModule
  ]
})
export class EmploymentModule { }
