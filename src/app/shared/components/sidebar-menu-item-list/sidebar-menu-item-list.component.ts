import {Component, Input, OnInit} from '@angular/core';
import {MenuItem} from '../../../models/menu-item';
import {EmployeeService} from '../../../services/employee.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sidebar-menu-item-list',
  templateUrl: './sidebar-menu-item-list.component.html',
  styleUrls: ['./sidebar-menu-item-list.component.scss'],
  animations: [
    trigger('expendCollapse', [
      state('collapse', style({
        height: '50px'
      })),
      state('expend', style({
        height: '!'
      })),
      transition('collapse <=> expend', animate('250ms ease-in-out'))
    ])
  ]
})
export class SidebarMenuItemListComponent implements OnInit {
  @Input()
  items: MenuItem[] = [];

  constructor(public empService: EmployeeService, private router: Router) {
  }

  ngOnInit(): void {
  }

  toggleCollapseOrNavigate(item: MenuItem, $event: MouseEvent) {
    $event.preventDefault();
    if (item.children.length) {
      item.toggle();
    } else {
      this.router.navigate([item.path]).then();
    }
  }
}
