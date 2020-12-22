import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MouseEnterLeaveDirective} from './directives/mouse-enter-leave.directive';
import {FooterComponent} from './components/footer/footer.component';
import {HeaderComponent} from './components/header/header.component';
import {ErrorPageComponent} from './components/error-page/error-page.component';


@NgModule({
  declarations: [
    FooterComponent,
    HeaderComponent,
    ErrorPageComponent,
    MouseEnterLeaveDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FooterComponent,
    HeaderComponent,
    ErrorPageComponent,
    MouseEnterLeaveDirective
  ]
})
export class SharedModule {
}
