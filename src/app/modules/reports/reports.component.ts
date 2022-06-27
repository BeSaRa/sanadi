import { Component, OnInit } from '@angular/core';
import { MenuItem } from "@app/models/menu-item";
import { LangService } from "@services/lang.service";
import { MenuItemService } from "@services/menu-item.service";

@Component({
  selector: 'reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  menuItems: MenuItem[] = this.menuItemService.getMenuByRouteGroup('reports');

  constructor(private langService: LangService,
              private menuItemService: MenuItemService) {
  }

  ngOnInit(): void {
  }

}
