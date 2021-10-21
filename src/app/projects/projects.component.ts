import { Component, OnInit } from '@angular/core';
import {MenuItem} from "@app/models/menu-item";
import {LangService} from "@app/services/lang.service";
import {MenuItemService} from "@app/services/menu-item.service";

@Component({
  selector: 'projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  menuItems: MenuItem[] = this.menuItemService.getMenuByRouteGroup('projects');

  constructor(private langService: LangService,
              private menuItemService: MenuItemService) {
  }

  ngOnInit(): void {
  }

}
