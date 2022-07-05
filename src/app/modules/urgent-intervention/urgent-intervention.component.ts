import {Component} from '@angular/core';
import {MenuItem} from '@app/models/menu-item';
import {MenuItemService} from '@services/menu-item.service';

@Component({
  selector: 'urgent-intervention',
  templateUrl: './urgent-intervention.component.html',
  styleUrls: ['./urgent-intervention.component.scss']
})
export class UrgentInterventionComponent {

  constructor(private menuItemService: MenuItemService) { }

  menuItems: MenuItem[] = this.menuItemService.getMenuByRouteGroup("urgent-intervention");

}
