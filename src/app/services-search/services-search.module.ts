import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ServicesSearchRoutingModule} from './services-search-routing.module';
import {ServicesSearchComponent} from './services-search.component';


@NgModule({
  declarations: [ServicesSearchComponent],
  imports: [
    CommonModule,
    ServicesSearchRoutingModule
  ]
})
export class ServicesSearchModule {
}
