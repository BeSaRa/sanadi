import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ContextMenuItemComponent} from './components/context-menu-item/context-menu-item.component';


@NgModule({
  declarations: [ContextMenuItemComponent],
  exports: [
    ContextMenuItemComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ContextMenuModule {
}
