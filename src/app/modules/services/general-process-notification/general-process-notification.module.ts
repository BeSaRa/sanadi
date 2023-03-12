import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralProcessNotificationRoutingModule } from './general-process-notification-routing.module';
import { GeneralProcessNotificationOutputsComponent } from './pages/general-process-notification-outputs/general-process-notification-outputs.component';
import {
  GeneralProcessNotificationComponent
} from '@modules/services/general-process-notification/pages/general-process-notification/general-process-notification.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {FormlyModule} from '@ngx-formly/core';
import {FormlyDateFieldComponent} from '@app/services-search/components/formly-date-field/formly-date-field.component';
import {
  FormlySelectFieldComponent
} from '@app/services-search/components/formly-select-field/formly-select-field.component';
import {
  FormlyMaskInputFieldComponent
} from '@app/services-search/components/formly-mask-input-field/formly-mask-input-field.component';
import {
  ProcessFieldWrapperComponent
} from '@app/administration/popups/general-process-popup/process-formly-components/process-field-wrapper/process-field-wrapper.component';
import {
  GeneralProcessNotificationApprovalPopupComponent
} from '@modules/services/general-process-notification/popups/general-process-notification-approval-popup/general-process-notification-approval-popup.component';


@NgModule({
  declarations: [
    GeneralProcessNotificationComponent,
    GeneralProcessNotificationOutputsComponent,
    GeneralProcessNotificationApprovalPopupComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    GeneralProcessNotificationRoutingModule,
    FormlyModule.forChild({
      types: [
        { name: 'dateField', component: FormlyDateFieldComponent, wrappers: ['custom-wrapper'] },
        { name: 'selectField', component: FormlySelectFieldComponent, wrappers: ['custom-wrapper'] },
        { name: 'yesOrNo', component: FormlySelectFieldComponent, wrappers: ['custom-wrapper'] },
        { name: 'maskInput', extends: 'input', component: FormlyMaskInputFieldComponent, wrappers: ['custom-wrapper'] },
        { name: 'number', extends: 'input', component: FormlyMaskInputFieldComponent, wrappers: ['custom-wrapper'] },
      ],
      wrappers: [
        { name: 'custom-wrapper', component: ProcessFieldWrapperComponent }
      ]
    })
  ]
})
export class GeneralProcessNotificationModule { }
