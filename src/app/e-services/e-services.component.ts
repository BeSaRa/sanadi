import {Component, OnInit} from '@angular/core';
import {MenuItem} from '../models/menu-item';
import {LangService} from '../services/lang.service';
import {MenuItemService} from '../services/menu-item.service';

@Component({
  selector: 'app-e-services',
  templateUrl: './e-services.component.html',
  styleUrls: ['./e-services.component.scss']
})
export class EServicesComponent implements OnInit {
  menuItems: MenuItem[] = this.menuItemService.getMenuByRouteGroup('e-services');

  constructor(private langService: LangService,
              private menuItemService: MenuItemService) {
    console.log(this.menuItems);
  }

  ngOnInit(): void {
  }

}
