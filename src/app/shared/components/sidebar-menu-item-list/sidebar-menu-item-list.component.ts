import {Component, Input, OnInit} from '@angular/core';
import {MenuItem} from '@app/models/menu-item';
import {EmployeeService} from '@app/services/employee.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Router} from '@angular/router';
import {CustomEmployeePermission} from "@app/helpers/custom-employee-permission";
import {LangService} from "@services/lang.service";
import {CommonService} from "@services/common.service";
import {Common} from "@app/models/common";

@Component({
  selector: 'app-sidebar-menu-item-list',
  templateUrl: './sidebar-menu-item-list.component.html',
  styleUrls: ['./sidebar-menu-item-list.component.scss'],
  animations: [
    trigger('expendCollapse', [
      state('collapse', style({
        height: '40px'
      })),
      state('expend', style({
        height: '!'
      })),
      transition('collapse <=> expend', animate('.2s ease-in-out')),
    ])
  ]
})
export class SidebarMenuItemListComponent implements OnInit {
  @Input()
  items: MenuItem[] = [];
  @Input()
  level!: number;
  _searchText: string = '';


  @Input()
  set searchText(value: string | null) {
    this._searchText = value ? value : '';
  }

  constructor(public empService: EmployeeService,
              public lang: LangService,
              private commonService: CommonService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.level = ++this.level;
  }

  toggleCollapseOrNavigate(item: MenuItem, $event: MouseEvent) {
    $event.preventDefault();
    if (item.children.length) {
      item.toggle();
    } else {
      this.router.navigate([item.path]).then();
      /*if (!item.isEServiceMenu) {
        this.router.navigate([item.path]).then();
      } else {
        if (item.hasEServiceSearchPermission) {
          this.openEServiceSearch($event, item);
        } else if (item.hasEServicePagePermission) {
          this.openEService($event, item);
        }
      }*/
    }
  }

  openEService($event: Event, item: MenuItem) {
    $event.preventDefault();
    $event.stopPropagation();
    if (!item.hasEServicePagePermission) {
      return;
    }
    this.router.navigate([item.path]).then();
  }

  openEServiceSearch($event: Event, item: MenuItem) {
    $event.preventDefault();
    $event.stopPropagation();
    if (!item.hasEServiceSearchPermission) {
      return;
    }
    this.router.navigate([item.defaultServiceSearchPath], {
      queryParams: {quickCaseType: item.caseType}
    }).then();
  }

  hasCustomPermissions(item: MenuItem): boolean {
    return CustomEmployeePermission.hasCustomPermission(item.langKey) ? CustomEmployeePermission.getCustomPermission(item.langKey)(this.empService, item) : true;
  }

  hasCounter(s: keyof Common['counters'] | undefined): boolean {
    return s ? this.commonService.hasCounter(s) : false
  }

  getCounter(s: keyof Common['counters'] | undefined): string {
    return s ? this.commonService.getCounter(s) : '';
  }
}
