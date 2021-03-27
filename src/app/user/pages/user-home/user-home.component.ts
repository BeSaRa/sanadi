import {Component, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {MenuItem} from '../../../models/menu-item';
import {MenuItemService} from '../../../services/menu-item.service';

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
