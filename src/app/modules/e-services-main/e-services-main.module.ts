import {SelectBankAccountPopupComponent} from './popups/select-bank-account-popup/select-bank-account-popup.component';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
  SelectLicensePopupComponent
} from '@app/modules/e-services-main/popups/select-license-popup/select-license-popup.component';
import {
  SelectTemplatePopupComponent
} from '@app/modules/e-services-main/popups/select-template-popup/select-template-popup.component';
import {
  SelectedLicenseTableComponent
} from '@app/modules/e-services-main/shared/selected-license-table/selected-license-table.component';
import {SharedModule} from '@app/shared/shared.module';
import {FormlyBootstrapModule} from '@ngx-formly/bootstrap';
import {FormlyModule} from '@ngx-formly/core';
import {
  ProcessFieldWrapperComponent
} from '@app/administration/popups/general-process-popup/process-formly-components/process-field-wrapper/process-field-wrapper.component';
import {FormlyDateFieldComponent} from '@app/services-search/components/formly-date-field/formly-date-field.component';
import {
  FormlyMaskInputFieldComponent
} from '@app/services-search/components/formly-mask-input-field/formly-mask-input-field.component';
import {
  FormlySelectFieldComponent
} from '@app/services-search/components/formly-select-field/formly-select-field.component';
import { CaseAuditPopupComponent } from './popups/case-audit-popup/case-audit-popup.component';
import { CaseAuditDifferencesPopupComponent } from './popups/case-audit-differences-popup/case-audit-differences-popup.component';

@NgModule({
  declarations: [
    SelectLicensePopupComponent,
    SelectTemplatePopupComponent,
    SelectedLicenseTableComponent,
    SelectBankAccountPopupComponent,
    CaseAuditPopupComponent,
    CaseAuditDifferencesPopupComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormlyBootstrapModule,
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
    }),
  ],
  exports: [
    SharedModule,
    SelectedLicenseTableComponent
  ]
})
export class EServicesMainModule {
}
