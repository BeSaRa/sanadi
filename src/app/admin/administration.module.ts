import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AdminRoutingModule} from './admin-routing.module';
import {AdminHomeComponent} from './pages/admin-home/admin-home.component';
import {SharedModule} from '../shared/shared.module';
import {LocalizationComponent} from './pages/localization/localization.component';
import { LocalizationPopupComponent } from './popups/localization-popup/localization-popup.component';


@NgModule({
  declarations: [AdminHomeComponent, LocalizationComponent, LocalizationPopupComponent],
    imports: [
        CommonModule,
        AdminRoutingModule,
        SharedModule
    ]
})
export class AdministrationModule {
}
