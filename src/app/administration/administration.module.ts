import {NgModule} from '@angular/core';

import {AdminRoutingModule} from './admin-routing.module';
import {AdminHomeComponent} from './pages/admin-home/admin-home.component';
import {SharedModule} from '../shared/shared.module';
import {LocalizationComponent} from './pages/localization/localization.component';
import {LocalizationPopupComponent} from './popups/localization-popup/localization-popup.component';
import {CustomRoleComponent} from './pages/custom-role/custom-role.component';
import { CustomRolePopupComponent } from './popups/custom-role-popup/custom-role-popup.component';
import { OrganizationUnitComponent } from './pages/organization-unit/organization-unit.component';
import { OrganizationUnitPopupComponent } from './popups/organization-unit-popup/organization-unit-popup.component';


@NgModule({
  declarations: [AdminHomeComponent, LocalizationComponent, LocalizationPopupComponent, CustomRoleComponent, CustomRolePopupComponent, OrganizationUnitComponent, OrganizationUnitPopupComponent],
  imports: [
    SharedModule,
    AdminRoutingModule,
  ]
})
export class AdministrationModule {
}
