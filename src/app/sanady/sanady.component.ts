import {Component, OnInit} from '@angular/core';
import {MenuItem} from "../models/menu-item";
import {LangService} from "../services/lang.service";
import {MenuItemService} from "../services/menu-item.service";

@Component({
  selector: 'sanady',
  templateUrl: './sanady.component.html',
  styleUrls: ['./sanady.component.scss']
})
export class SanadyComponent implements OnInit {
  menuItems: MenuItem[] = this.menuItemService.getMenuByRouteGroup('sanady');

  constructor(private langService: LangService,
              private menuItemService: MenuItemService) {

  }

  ngOnInit(): void {

  }

}
