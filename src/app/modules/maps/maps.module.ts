import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GoogleMapsModule} from "@angular/google-maps";
import {HttpClientModule} from "@angular/common/http";
import {RacaMapsComponent} from './raca-maps/raca-maps.component';
import {ContextMenuModule} from "@app/modules/context-menu/context-menu.module";
import {RacaMapsPopupComponent} from './poups/raca-maps-popup/raca-maps-popup.component';
import {SharedModule} from "@app/shared/shared.module";


@NgModule({
  declarations: [
    RacaMapsComponent,
    RacaMapsPopupComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    HttpClientModule,
    GoogleMapsModule,
    ContextMenuModule
  ],
  exports: [
    RacaMapsComponent,
    GoogleMapsModule,
  ]
})
export class MapsModule {
}
