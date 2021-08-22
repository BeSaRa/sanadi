import {Component, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {MenuItem} from '@app/models/menu-item';
import {MenuItemService} from '@app/services/menu-item.service';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit {
  menuItems: MenuItem[] = this.menuItemService.getMenuByRouteGroup('main');

  constructor(private langService: LangService,
              private menuItemService: MenuItemService) {

  }

  ngOnInit(): void {

  }

}
