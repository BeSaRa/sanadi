import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneralServicesComponent } from './general-services.component';
import { EServiceComponentWrapperComponent } from '@app/shared/components/e-service-component-wrapper/e-service-component-wrapper.component';
import { ServicesGuard } from '@app/guards/services.guard';
import { ServiceItemResolver } from '@app/resolvers/service-item.resolver';
import { EServicePermissions } from '@app/enums/e-service-permissions';
import { ForeignCountriesProjectsComponent } from './pages/foreign-countries-projects/foreign-countries-projects.component';

const routes: Routes = [
  { path: '', component: GeneralServicesComponent },
  {
    path: 'inquiries', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissions.INQUIRY,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'InquiryComponent'
    }
  },
  {
    path: 'consultations', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissions.CONSULTATION,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'ConsultationComponent'
    }
  },
  {
    path: 'external-org-affiliation', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissions.EXTERNAL_ORG_AFFILIATION_REQUEST,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'ExternalOrgAffiliationComponent'
    }
  },
  {
    path: 'international-coop', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissions.INTERNATIONAL_COOPERATION,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'InternationalCooperationComponent'
    }
  },
  {
    path: 'employment', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissions.EMPLOYMENT,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'EmploymentComponent'
    }
  },
  {
    path: 'foreign-countries-projects', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissions.FOREIGN_COUNTRIES_PROJECTS,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'ForeignCountriesProjectsComponent'
    }
  },
  {
    path: 'charity-organization-update', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: { info: ServiceItemResolver },
    data: {

      permissionKey: EServicePermissions.EMPLOYMENT,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'CharityOrganizationUpdateComponent'
    }
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneralServicesRoutingModule {
}
