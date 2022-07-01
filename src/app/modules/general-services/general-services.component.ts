import {Component} from '@angular/core';
import {MenuItem} from '@app/models/menu-item';
import {LangService} from '@services/lang.service';
import {MenuItemService} from '@services/menu-item.service';

@Component({
  selector: 'general-services',
  templateUrl: './general-services.component.html',
  styleUrls: ['./general-services.component.scss']
})
export class GeneralServicesComponent {

  constructor(private langService: LangService,
              private menuItemService: MenuItemService) {
  }

  menuItems: MenuItem[] = this.menuItemService.getMenuByRouteGroup('general-services');

}
