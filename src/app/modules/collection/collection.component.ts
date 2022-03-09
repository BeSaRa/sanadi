import {Component, OnInit} from '@angular/core';
import {MenuItem} from "@app/models/menu-item";
import {LangService} from "@app/services/lang.service";
import {MenuItemService} from "@app/services/menu-item.service";

@Component({
  selector: 'collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {

  menuItems: MenuItem[] = this.menuItemService.getMenuByRouteGroup('collection');

  constructor(private langService: LangService,
              private menuItemService: MenuItemService) {
  }

  ngOnInit(): void {
  }

}
