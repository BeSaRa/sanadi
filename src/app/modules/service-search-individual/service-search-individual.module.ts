import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ServiceSearchIndividualRoutingModule} from './service-search-individual-routing.module';
import {SearchServiceIndividualComponent} from './search-service-individual/search-service-individual.component';
import {SharedModule} from '@app/shared/shared.module';
import {FormlyModule} from '@ngx-formly/core';
import {FormlyDateFieldComponent} from '@app/services-search/components/formly-date-field/formly-date-field.component';
import {
  FormlySelectFieldComponent
} from '@app/services-search/components/formly-select-field/formly-select-field.component';
import {
  FormlyMaskInputFieldComponent
} from '@app/services-search/components/formly-mask-input-field/formly-mask-input-field.component';
import {
  FormlyFieldWrapperComponent
} from '@app/services-search/components/formly-field-wrapper/formly-field-wrapper.component';
import {
  FormlyFieldFullWrapperComponent
} from '@app/services-search/components/formly-field-full-wrapper/formly-field-full-wrapper.component';


@NgModule({
  declarations: [
    SearchServiceIndividualComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ServiceSearchIndividualRoutingModule,
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
export class ServiceSearchIndividualModule { }
