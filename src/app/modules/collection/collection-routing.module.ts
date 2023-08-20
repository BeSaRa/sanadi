import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CollectionComponent} from './collection.component';
import {
  EServiceComponentWrapperComponent
} from "@app/shared/components/e-service-component-wrapper/e-service-component-wrapper.component";
import {ServicesGuard} from "@app/guards/services.guard";
import {ServiceItemResolver} from "@app/resolvers/service-item.resolver";
import {EServicePermissionsEnum} from '@app/enums/e-service-permissions-enum';

const routes: Routes = [
  {path: '', component: CollectionComponent},
  {
    path: 'collection-services-approval',
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: {info: ServiceItemResolver.resolve},
    data: {
      permissionKey: EServicePermissionsEnum.COLLECTION_APPROVAL,
      configPermissionGroup: null, checkAnyPermission: false,
      render: 'CollectionApprovalComponent'
    }
  },
  {
    path: 'fundraising',
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: {info: ServiceItemResolver.resolve},
    data: {
      permissionKey: EServicePermissionsEnum.FUNDRAISING_LICENSING,
      configPermissionGroup: null, checkAnyPermission: false,
      render: 'FundraisingComponent'
    }
  },
  {
    path: 'collector-approval',
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: {info: ServiceItemResolver.resolve},
    data: {
      permissionKey: EServicePermissionsEnum.COLLECTOR_LICENSING,
      configPermissionGroup: null, checkAnyPermission: false,
      render: 'CollectorApprovalComponent'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollectionRoutingModule {
}
