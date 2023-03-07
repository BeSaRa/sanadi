import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ChooseTemplatePopupComponent
} from '@modules/services/shared-services/popups/choose-template-popup/choose-template-popup.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';



@NgModule({
  declarations: [
    ChooseTemplatePopupComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule
  ],
  exports: [
    ChooseTemplatePopupComponent
  ]
})
export class SharedServicesModule { }
