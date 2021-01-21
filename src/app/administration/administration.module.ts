import {NgModule} from '@angular/core';

import {AdminRoutingModule} from './admin-routing.module';
import {AdminHomeComponent} from './pages/admin-home/admin-home.component';
import {SharedModule} from '../shared/shared.module';
import {LocalizationComponent} from './pages/localization/localization.component';
import {LocalizationPopupComponent} from './popups/localization-popup/localization-popup.component';
import {CustomRoleComponent} from './pages/custom-role/custom-role.component';
import {CustomRolePopupComponent} from './popups/custom-role-popup/custom-role-popup.component';
import {AidLookupComponent} from './pages/aid-lookup/aid-lookup.component';
import {AidLookupPopupComponent} from './popups/aid-lookup-popup/aid-lookup-popup.component';
import {AidLookupContainerComponent} from './pages/aid-lookup-container/aid-lookup-container.component';
import {OrganizationUnitComponent} from './pages/organization-unit/organization-unit.component';
import {OrganizationUnitPopupComponent} from './popups/organization-unit-popup/organization-unit-popup.component';
import {OrganizationBranchPopupComponent} from './popups/organization-branch-popup/organization-branch-popup.component';
import {OrganizationBranchComponent} from './pages/organization-branch/organization-branch.component';
import {OrganizationUserComponent} from './pages/organization-user/organization-user.component';
import {OrganizationUserPopupComponent} from './popups/organization-user-popup/organization-user-popup.component';

@NgModule({
  declarations: [AdminHomeComponent, LocalizationComponent, LocalizationPopupComponent, CustomRoleComponent, CustomRolePopupComponent, AidLookupComponent, AidLookupPopupComponent, AidLookupContainerComponent, OrganizationUnitComponent, OrganizationUnitPopupComponent, OrganizationBranchPopupComponent, OrganizationBranchComponent, OrganizationUserComponent, OrganizationUserPopupComponent],
  imports: [
    SharedModule,
    AdminRoutingModule,
  ]
})
export class AdministrationModule {
}
