import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DynamicMenusComponent} from './dynamic-menus.component';
import {DynamicMenuDetailsComponent} from '@app/modules/dynamic-menus/dynamic-menu-details/dynamic-menu-details.component';
import {DynamicMenuGuard} from '@app/guards/dynamic-menu.guard';
import {DynamicMenuRouteTypeEnum} from '@app/enums/dynamic-menu-route-type.enum';

const routes: Routes = [
  {
    path: ':parentId', component: DynamicMenusComponent,
    canActivate: [DynamicMenuGuard],
    data: {checkType: DynamicMenuRouteTypeEnum.PARENT}
  },
  {
    path: ':parentId/details', component: DynamicMenuDetailsComponent,
    canActivate: [DynamicMenuGuard],
    data: {checkType: DynamicMenuRouteTypeEnum.PARENT_DETAILS}
  },
  {
    path: ':parentId/details/:childId', component: DynamicMenuDetailsComponent,
    canActivate: [DynamicMenuGuard],
    data: {checkType: DynamicMenuRouteTypeEnum.CHILD}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DynamicMenusRoutingModule {
}
