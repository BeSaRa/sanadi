import {Component} from '@angular/core';
import {MenuItem} from '@app/models/menu-item';
import {MenuItemService} from '@services/menu-item.service';
import {ActivatedRoute} from '@angular/router';
import {CommonUtils} from '@helpers/common-utils';

@Component({
  selector: 'dynamic-menus',
  templateUrl: './dynamic-menus.component.html',
  styleUrls: ['./dynamic-menus.component.scss']
})
export class DynamicMenusComponent {
  menuItems: MenuItem[] = [];

  constructor(private menuItemService: MenuItemService,
              private route: ActivatedRoute) {
    const parentId = route.snapshot.paramMap.get('parentId');
    if (!CommonUtils.isValidValue(parentId)) {
      return;
    }
    this.menuItems = this.menuItemService.getMenuByRouteGroup('dynamic-menus-' + Number(parentId));
  }

}
