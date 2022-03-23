import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CollectionComponent} from './collection.component';
import {
  EServiceComponentWrapperComponent
} from "@app/shared/components/e-service-component-wrapper/e-service-component-wrapper.component";
import {ServicesGuard} from "@app/guards/services.guard";
import {ServiceItemResolver} from "@app/resolvers/service-item.resolver";

const routes: Routes = [
  {path: '', component: CollectionComponent},
  {
    path: 'collection-services-approval',
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      render: 'CollectionApprovalComponent'
    }
  },
  {
    path: 'fundraising',
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      render: 'FundraisingComponent'
    }
  },
  {
    path: 'collector-approval',
    component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
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
