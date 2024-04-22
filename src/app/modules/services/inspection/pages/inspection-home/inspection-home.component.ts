import { Component } from '@angular/core';
import { MenuItem } from '@app/models/menu-item';
import { LangService } from '@app/services/lang.service';
import { MenuItemService } from '@app/services/menu-item.service';

@Component({
    selector: 'inspection-home',
    templateUrl: 'inspection-home.component.html',
    styleUrls: ['inspection-home.component.scss']
})
export class InspectionHomeComponent {
    menuItems: MenuItem[] = this.menuItemService.getMenuByRouteGroup('Inspection');

    constructor(                private menuItemService: MenuItemService) {
  
    }
}
