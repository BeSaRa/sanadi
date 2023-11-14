import { Component, OnInit } from '@angular/core';
import { MenuItem } from '@app/models/menu-item';
import { LangService } from '@app/services/lang.service';
import { MenuItemService } from '@app/services/menu-item.service';

@Component({
  selector: 'restricted',
  templateUrl: './restricted.component.html',
  styleUrls: ['./restricted.component.scss']
})
export class RestrictedComponent implements OnInit {
  menuItems: MenuItem[] = this.menuItemService.getMenuByRouteGroup('restricted');

  constructor(private langService: LangService,
    private menuItemService: MenuItemService) {
  }

  ngOnInit() {
  }

}
