import {Component, Input, OnInit} from '@angular/core';
import {MenuItem} from '../../../models/menu-item';
import {EmployeeService} from '../../../services/employee.service';

@Component({
  selector: 'app-sidebar-menu-item-list',
  templateUrl: './sidebar-menu-item-list.component.html',
  styleUrls: ['./sidebar-menu-item-list.component.scss']
})
export class SidebarMenuItemListComponent implements OnInit {
  @Input()
  items: MenuItem[] = [];

  constructor(public empService: EmployeeService) {
  }

  ngOnInit(): void {
  }
}
