import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminHomeComponent} from './pages/admin-home/admin-home.component';
import {LocalizationComponent} from './pages/localization/localization.component';
import {CustomRoleComponent} from './pages/custom-role/custom-role.component';
import {OrganizationUnitComponent} from './pages/organization-unit/organization-unit.component';
import {AidLookupContainerComponent} from './pages/aid-lookup-container/aid-lookup-container.component';
import {OrganizationUserComponent} from './pages/organization-user/organization-user.component';
import {PermissionGuard} from '../guards/permission-guard';
import {AttachmentTypesComponent} from './pages/attachment-types/attachment-types.component';
import {ServiceDataComponent} from './pages/service-data/service-data.component';
import {TeamComponent} from './pages/team/team.component';
import {CountryComponent} from './pages/country/country.component';
import {InternalUserComponent} from "./pages/internal-user/internal-user.component";
import {InternalDepartmentComponent} from '@app/administration/pages/internal-department/internal-department.component';
import {JobTitleComponent} from '@app/administration/pages/job-title/job-title.component';
import {DacOchaComponent} from '@app/administration/pages/dac-ocha/dac-ocha.component';

const routes: Routes = [
  {path: '', component: AdminHomeComponent},
  {path: 'localization', component: LocalizationComponent},
  {
    path: 'custom-role', component: CustomRoleComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'MANAGE_CUSTOM_ROLE'}
  },
  {
    path: 'organizations', component: OrganizationUnitComponent,
    canActivate: [PermissionGuard],
    data: {configPermissionGroup: 'MANAGE_ORG_PERMISSIONS_GROUP', checkAnyPermission: true}
  },
  {
    path: 'aid', component: AidLookupContainerComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'MANAGE_AID_TYPE'}
  },
  {
    path: 'users', component: OrganizationUserComponent,
    canActivate: [PermissionGuard],
    data: {configPermissionGroup: 'MANAGE_USER_PERMISSIONS_GROUP', checkAnyPermission: true}
  },
  {path: 'services', component: ServiceDataComponent},
  {
    path: 'attachment-types', component: AttachmentTypesComponent,
    canActivate: [PermissionGuard],
    // data: {configPermissionGroup: 'MANAGE_USER_PERMISSIONS_GROUP', checkAnyPermission: true}
  },
  {
    path: 'teams', component: TeamComponent
  },
  {
    path: 'countries', component: CountryComponent
  },
  {path: 'internal-users', component: InternalUserComponent},
  {path: 'internal-departments', component: InternalDepartmentComponent},
  {path: 'job-titles', component: JobTitleComponent},
  {path: 'ocha-dac-class', component: DacOchaComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
