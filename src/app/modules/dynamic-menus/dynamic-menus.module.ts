import {NgModule} from '@angular/core';
import {SharedModule} from '@app/shared/shared.module';

import {DynamicMenusRoutingModule} from './dynamic-menus-routing.module';
import {DynamicMenusComponent} from './dynamic-menus.component';
import {DynamicMenuDetailsComponent} from './dynamic-menu-details/dynamic-menu-details.component';


@NgModule({
  declarations: [
    DynamicMenusComponent,
    DynamicMenuDetailsComponent
  ],
  imports: [
    SharedModule,
    DynamicMenusRoutingModule
  ]
})
export class DynamicMenusModule {
}
