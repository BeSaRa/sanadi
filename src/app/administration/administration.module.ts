import {NgModule} from '@angular/core';

import {AdminRoutingModule} from './admin-routing.module';
import {AdminHomeComponent} from './pages/admin-home/admin-home.component';
import {SharedModule} from '../shared/shared.module';
import {LocalizationComponent} from './pages/localization/localization.component';
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
import {OrganizationBranchUserComponent} from './pages/organization-branch-user/organization-branch-user.component';
import {AuditLogPopupComponent} from './popups/audit-log-popup/audit-log-popup.component';
import {AttachmentTypesComponent} from './pages/attachment-types/attachment-types.component';
import {AttachmentTypesPopupComponent} from './popups/attachment-types-popup/attachment-types-popup.component';
import {ServiceDataComponent} from './pages/service-data/service-data.component';
import {ServiceDataPopupComponent} from './popups/service-data-popup/service-data-popup.component';
import {TeamComponent} from './pages/team/team.component';
import {TeamPopupComponent} from './popups/team-popup/team-popup.component';
import {CountryComponent} from './pages/country/country.component';
import {CountryPopupComponent} from './popups/country-popup/country-popup.component';
import { ChangeCountryParentPopupComponent } from './popups/change-country-parent-popup/change-country-parent-popup.component';
import { AttachmentTypeServiceDataPopupComponent } from './popups/attachment-type-service-data-popup/attachment-type-service-data-popup.component';
import { InternalUserComponent } from './pages/internal-user/internal-user.component';
import { InternalUserPopupComponent } from './popups/internal-user-popup/internal-user-popup.component';
import { InternalDepartmentComponent } from './pages/internal-department/internal-department.component';
import { InternalDepartmentPopupComponent } from './popups/internal-department-popup/internal-department-popup.component';
import { JobTitleComponent } from './pages/job-title/job-title.component';
import { JobTitlePopupComponent } from './popups/job-title-popup/job-title-popup.component';

@NgModule({
  declarations: [AdminHomeComponent, LocalizationComponent, CustomRoleComponent, CustomRolePopupComponent, AidLookupComponent,
    AidLookupPopupComponent, AidLookupContainerComponent, OrganizationUnitComponent, OrganizationUnitPopupComponent,
    OrganizationBranchPopupComponent, OrganizationBranchComponent, OrganizationUserComponent,
    OrganizationUserPopupComponent, OrganizationBranchUserComponent, AuditLogPopupComponent, AttachmentTypesComponent, AttachmentTypesPopupComponent, TeamComponent, TeamPopupComponent, ServiceDataComponent, ServiceDataPopupComponent, CountryComponent, CountryPopupComponent, ChangeCountryParentPopupComponent, AttachmentTypeServiceDataPopupComponent,InternalUserComponent,InternalUserPopupComponent, InternalDepartmentComponent, InternalDepartmentPopupComponent, JobTitleComponent, JobTitlePopupComponent],
  imports: [
    SharedModule,
    AdminRoutingModule,
  ]
})
export class AdministrationModule {
}
