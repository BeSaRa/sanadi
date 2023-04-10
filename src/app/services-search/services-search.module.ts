import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ServicesSearchRoutingModule} from './services-search-routing.module';
import {ServicesSearchComponent} from './services-search.component';
import {SharedModule} from '../shared/shared.module';
import {FormlyModule} from '@ngx-formly/core';
import { FormlyDateFieldComponent } from './components/formly-date-field/formly-date-field.component';
import { FormlySelectFieldComponent } from './components/formly-select-field/formly-select-field.component';
import { FormlyMaskInputFieldComponent } from './components/formly-mask-input-field/formly-mask-input-field.component';
import { FormlyFieldWrapperComponent } from './components/formly-field-wrapper/formly-field-wrapper.component';
import { FormlyFieldFullWrapperComponent } from './components/formly-field-full-wrapper/formly-field-full-wrapper.component';



@NgModule({
  declarations: [
    ServicesSearchComponent,
    FormlyFieldWrapperComponent,
    FormlyFieldFullWrapperComponent,
    FormlyDateFieldComponent,
    FormlySelectFieldComponent,
    FormlyMaskInputFieldComponent

  ],
  imports: [
    CommonModule,
    SharedModule,
    ServicesSearchRoutingModule,
    FormlyModule.forChild({
      types: [
        {name: 'dateField', component: FormlyDateFieldComponent, wrappers: ['col-md-4-8']},
        {name: 'selectField', component: FormlySelectFieldComponent, wrappers: ['col-md-4-8']},
        {name: 'maskInput', extends: 'input', component: FormlyMaskInputFieldComponent, wrappers: ['col-md-4-8']},
      ],
      wrappers: [
        {name: 'col-md-4-8', component: FormlyFieldWrapperComponent},
        {name: 'col-md-2-10', component: FormlyFieldFullWrapperComponent}
      ]
    })
  ]
})
export class ServicesSearchModule {
}
