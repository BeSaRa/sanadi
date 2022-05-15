import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CollectionComponent} from './collection.component';
import {
  EServiceComponentWrapperComponent
} from "@app/shared/components/e-service-component-wrapper/e-service-component-wrapper.component";
import {ServicesGuard} from "@app/guards/services.guard";
import {ServiceItemResolver} from "@app/resolvers/service-item.resolver";
import {EServicePermissions} from '@app/enums/e-service-permissions';

const routes: Routes = [
  {path: '', component: CollectionComponent},
  {
    path: 'collection-services-approval',
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.COLLECTION_APPROVAL,
      configPermissionGroup: null, checkAnyPermission: false,
      render: 'CollectionApprovalComponent'
    }
  },
  {
    path: 'fundraising',
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.FUNDRAISING_LICENSING,
      configPermissionGroup: null, checkAnyPermission: false,
      render: 'FundraisingComponent'
    }
  },
  {
    path: 'collector-approval',
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.COLLECTOR_LICENSING,
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
