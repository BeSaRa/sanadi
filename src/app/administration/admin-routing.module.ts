import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminHomeComponent} from './pages/admin-home/admin-home.component';
import {LocalizationComponent} from './pages/localization/localization.component';
import {CustomRoleComponent} from './pages/custom-role/custom-role.component';
import {OrganizationUnitComponent} from './pages/organization-unit/organization-unit.component';
import {AidLookupContainerComponent} from './pages/aid-lookup-container/aid-lookup-container.component';
import {OrganizationUserComponent} from './pages/organization-user/organization-user.component';

const routes: Routes = [
  {path: '', component: AdminHomeComponent},
  {path: 'localization', component: LocalizationComponent},
  {path: 'custom-role', component: CustomRoleComponent},
  {path: 'organizations', component: OrganizationUnitComponent},
  {path: 'aid', component: AidLookupContainerComponent},
  {path: 'users', component: OrganizationUserComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
