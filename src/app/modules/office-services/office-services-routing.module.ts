import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OfficeServicesComponent} from './office-services.component';
import {EServiceComponentWrapperComponent} from '@app/shared/components/e-service-component-wrapper/e-service-component-wrapper.component';
import {ServicesGuard} from '@app/guards/services.guard';
import {ServiceItemResolver} from '@app/resolvers/service-item.resolver';
import {EServicePermissionsEnum} from '@app/enums/e-service-permissions-enum';

const routes: Routes = [
  {path: '', component: OfficeServicesComponent},
  {
    path: 'partner-approval',
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissionsEnum.PARTNER_APPROVAL,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'PartnerApprovalComponent'
    }
  },
  {
    path: 'initial-external-office-approval',
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissionsEnum.INITIAL_EXTERNAL_OFFICE_APPROVAL,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'InitialExternalOfficeApprovalComponent'
    }
  },
  {
    path: 'final-external-office-approval',
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissionsEnum.FINAL_EXTERNAL_OFFICE_APPROVAL,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'FinalExternalOfficeApprovalComponent'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OfficeServicesRoutingModule { }
