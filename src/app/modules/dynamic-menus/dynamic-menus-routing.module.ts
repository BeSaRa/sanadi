import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DynamicMenusComponent} from './dynamic-menus.component';
import {DynamicMenuDetailsComponent} from '@app/modules/dynamic-menus/dynamic-menu-details/dynamic-menu-details.component';
import {DynamicMenuGuard} from '@app/guards/dynamic-menu.guard';
import {DynamicMenuRouteTypeEnum} from '@app/enums/dynamic-menu-route-type.enum';

const routes: Routes = [
  {
    path: ':parentId', component: DynamicMenusComponent,
    canActivate: [DynamicMenuGuard.canActivate],
    data: {dynamicMenuRouteType: DynamicMenuRouteTypeEnum.PARENT}
  },
  {
    path: ':parentId/details', component: DynamicMenuDetailsComponent,
    canActivate: [DynamicMenuGuard.canActivate],
    data: {dynamicMenuRouteType: DynamicMenuRouteTypeEnum.PARENT_DETAILS}
  },
  {
    path: ':parentId/details/:childId', component: DynamicMenuDetailsComponent,
    canActivate: [DynamicMenuGuard.canActivate],
    data: {dynamicMenuRouteType: DynamicMenuRouteTypeEnum.CHILD}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DynamicMenusRoutingModule {
}
