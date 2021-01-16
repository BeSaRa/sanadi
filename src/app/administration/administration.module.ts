import {NgModule} from '@angular/core';

import {AdminRoutingModule} from './admin-routing.module';
import {AdminHomeComponent} from './pages/admin-home/admin-home.component';
import {SharedModule} from '../shared/shared.module';
import {LocalizationComponent} from './pages/localization/localization.component';
import {LocalizationPopupComponent} from './popups/localization-popup/localization-popup.component';
import {CustomRoleComponent} from './pages/custom-role/custom-role.component';
import { CustomRolePopupComponent } from './popups/custom-role-popup/custom-role-popup.component';


@NgModule({
  declarations: [AdminHomeComponent, LocalizationComponent, LocalizationPopupComponent, CustomRoleComponent, CustomRolePopupComponent],
  imports: [
    SharedModule,
    AdminRoutingModule,
  ]
})
export class AdministrationModule {
}
