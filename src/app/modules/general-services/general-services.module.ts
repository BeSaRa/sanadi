import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
  ProcessFieldWrapperComponent
} from '@app/administration/popups/general-process-popup/process-formly-components/process-field-wrapper/process-field-wrapper.component';
import {
  CoordinationWithOrganizationsRequestComponent
} from '@app/modules/general-services/pages/coordination-with-organizations-request/coordination-with-organizations-request.component';
import {FormlyBootstrapModule} from '@ngx-formly/bootstrap';
import {FormlyModule} from '@ngx-formly/core';

import {EServicesMainModule} from '@app/modules/e-services-main/e-services-main.module';
import {OfficeServicesModule} from '../office-services/office-services.module';
import {GeneralServicesRoutingModule} from './general-services-routing.module';
import {GeneralServicesComponent} from './general-services.component';
import {
  CoordinationWithOrgPopupComponent
} from './popups/coordination-with-org-popup/coordination-with-org-popup.component';
import {FormlyDateFieldComponent} from '@app/services-search/components/formly-date-field/formly-date-field.component';
import {
  FormlyMaskInputFieldComponent
} from '@app/services-search/components/formly-mask-input-field/formly-mask-input-field.component';
import {
  FormlySelectFieldComponent
} from '@app/services-search/components/formly-select-field/formly-select-field.component';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';


@NgModule({
  declarations: [
    GeneralServicesComponent,
    CoordinationWithOrganizationsRequestComponent,

    CoordinationWithOrgPopupComponent,

  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    GeneralServicesRoutingModule,
    OfficeServicesModule,
    FormlyBootstrapModule,
    FormlyModule.forChild({
      types: [
        {name: 'dateField', component: FormlyDateFieldComponent, wrappers: ['custom-wrapper']},
        {name: 'selectField', component: FormlySelectFieldComponent, wrappers: ['custom-wrapper']},
        {name: 'yesOrNo', component: FormlySelectFieldComponent, wrappers: ['custom-wrapper']},
        {name: 'maskInput', extends: 'input', component: FormlyMaskInputFieldComponent, wrappers: ['custom-wrapper']},
        {name: 'number', extends: 'input', component: FormlyMaskInputFieldComponent, wrappers: ['custom-wrapper']},
      ],
      wrappers: [
        {name: 'custom-wrapper', component: ProcessFieldWrapperComponent}
      ]
    }),
  ]
})
export class GeneralServicesModule {
}
