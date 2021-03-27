import {Component, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {MenuItem} from '../../../models/menu-item';
import {MenuItemService} from '../../../services/menu-item.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent implements OnInit {
  menuItems: MenuItem[] = this.menuItemService.getMenuByRouteGroup('administration');

  constructor(private langService: LangService,
              private menuItemService: MenuItemService) {
  }

  ngOnInit(): void {
  }

}
