import { Component, OnInit } from '@angular/core';
import {MenuItem} from '@app/models/menu-item';
import {LangService} from '@app/services/lang.service';
import {MenuItemService} from '@app/services/menu-item.service';

@Component({
  selector: 'training-services',
  templateUrl: './training-services.component.html',
  styleUrls: ['./training-services.component.scss']
})
export class TrainingServicesComponent implements OnInit {
  menuItems: MenuItem[] = this.menuItemService.getMenuByRouteGroup('training-services-services');

  constructor(private langService: LangService,
              private menuItemService: MenuItemService) {
  }

  ngOnInit(): void {
  }
}
