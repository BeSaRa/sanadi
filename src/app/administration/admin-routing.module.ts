import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminHomeComponent} from './pages/admin-home/admin-home.component';
import {LocalizationComponent} from './pages/localization/localization.component';
import {CustomRoleComponent} from './pages/custom-role/custom-role.component';
import {OrganizationUnitComponent} from './pages/organization-unit/organization-unit.component';
import {AidLookupContainerComponent} from './pages/aid-lookup-container/aid-lookup-container.component';
import {OrganizationUserComponent} from './pages/organization-user/organization-user.component';
import {PermissionGuard} from '../guards/permission-guard';

const routes: Routes = [
  {path: '', component: AdminHomeComponent},
  {path: 'localization', component: LocalizationComponent},
  {
    path: 'custom-role', component: CustomRoleComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'MANAGE_CUSTOM_ROLE'}
  },
  {path: 'organizations', component: OrganizationUnitComponent},
  {
    path: 'aid', component: AidLookupContainerComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'MANAGE_AID_TYPE'}
  },
  {path: 'users', component: OrganizationUserComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
