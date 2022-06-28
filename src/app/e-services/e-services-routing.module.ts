import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EServicesComponent} from '@app/e-services/e-services.component';
import {EServicePermissions} from "@app/enums/e-service-permissions";
import {
  EServiceComponentWrapperComponent
} from "@app/shared/components/e-service-component-wrapper/e-service-component-wrapper.component";
import {ServicesGuard} from "@app/guards/services.guard";
import {ServiceItemResolver} from "@app/resolvers/service-item.resolver";

const routes: Routes = [
  {path: '', component: EServicesComponent},
  {
    path: 'inquiries', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
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
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.CONSULTATION,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'ConsultationComponent'
    }
  },
  {
    path: 'international-coop', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.INTERNATIONAL_COOPERATION,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'InternationalCooperationComponent'
    }
  },
  {
    path: 'partner-approval',
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.PARTNER_APPROVAL,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'PartnerApprovalComponent'
    }
  },
  {
    path: 'initial-external-office-approval',
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.INITIAL_EXTERNAL_OFFICE_APPROVAL,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'InitialExternalOfficeApprovalComponent'
    }
  },
  {
    path: 'final-external-office-approval',
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.FINAL_EXTERNAL_OFFICE_APPROVAL,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'FinalExternalOfficeApprovalComponent'
    }
  },
  {
    path: 'external-org-affiliation-request',
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.EXTERNAL_ORG_AFFILIATION_REQUEST,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'ExternalOrgAffiliationComponent'
    }
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EServicesRoutingModule {
}
