import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ServicesSearchRoutingModule} from './services-search-routing.module';
import {ServicesSearchComponent} from './services-search.component';
import {SharedModule} from '../shared/shared.module';
import {FormlyModule} from '@ngx-formly/core';
import {FormlyFieldWrapperComponent} from './components/formly-field-wrapper/formly-field-wrapper.component';
import {FormlyFieldFullWrapperComponent} from './components/formly-field-full-wrapper/formly-field-full-wrapper.component';


@NgModule({
  declarations: [
    ServicesSearchComponent,
    FormlyFieldWrapperComponent,
    FormlyFieldFullWrapperComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ServicesSearchRoutingModule,
    FormlyModule.forChild({
      wrappers: [
        {name: 'col-md-4-8', component: FormlyFieldWrapperComponent},
        {name: 'col-md-2-10', component: FormlyFieldFullWrapperComponent}
      ]
    })
  ]
})
export class ServicesSearchModule {
}
