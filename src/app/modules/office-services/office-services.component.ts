import {Component} from '@angular/core';
import {MenuItem} from '@app/models/menu-item';
import {LangService} from '@services/lang.service';
import {MenuItemService} from '@services/menu-item.service';

@Component({
  selector: 'office-services',
  templateUrl: './office-services.component.html',
  styleUrls: ['./office-services.component.scss']
})
export class OfficeServicesComponent {

  constructor(private langService: LangService,
              private menuItemService: MenuItemService) { }

  menuItems: MenuItem[] = this.menuItemService.getMenuByRouteGroup('office-services');

}
