import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MouseEnterLeaveDirective} from './directives/mouse-enter-leave.directive';
import {FooterComponent} from './components/footer/footer.component';
import {HeaderComponent} from './components/header/header.component';
import {ErrorPageComponent} from './components/error-page/error-page.component';
import {ToastComponent} from './components/toast/toast.component';
import {ServiceListComponent} from './components/service-list/service-list.component';
import {RouterModule} from '@angular/router';


@NgModule({
  declarations: [
    FooterComponent,
    HeaderComponent,
    ErrorPageComponent,
    MouseEnterLeaveDirective,
    ToastComponent,
    ServiceListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([])
  ],
  exports: [
    FooterComponent,
    HeaderComponent,
    ErrorPageComponent,
    MouseEnterLeaveDirective,
    ToastComponent,
    ServiceListComponent
  ]
})
export class SharedModule {
}
