import { Injectable } from '@angular/core';
import { MenuItem } from '@models/menu-item';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { FactoryService } from './factory.service';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { CastResponse } from '@decorators/cast-response';
import { StaticAppResourcesService } from '@services/static-app-resources.service';
import { CustomMenuService } from '@services/custom-menu.service';
import { EmployeeService } from './employee.service';

@Injectable({
  providedIn: 'root'
})
export class MenuItemService {
  menuItems: MenuItem[] = [];
  parents!: MenuItem[];
  resetMenuItems$: Subject<boolean> = new Subject<boolean>();
  private children: Map<number, MenuItem[]> = new Map<number, MenuItem[]>();

  constructor(public http: HttpClient, private domSanitizer: DomSanitizer,
    private staticResourcesService: StaticAppResourcesService,
    private employeeService: EmployeeService) {
    FactoryService.registerService('MenuItemService', this);
    FactoryService.registerService('DomSanitizer', domSanitizer);
  }

  /**
   * @description Loads all type of menus in system and typecast them to MenuItem[]
   */
  loadAllMenus() {
    let customMenuService: CustomMenuService = FactoryService.getService('CustomMenuService');
    // let reportService: ReportService = FactoryService.getService('ReportService');
    return this.load(false)
      // .pipe(switchMap(() => reportService.loadReportsMenu()))
      // .pipe(tap((reportsMenuList) => reportService.prepareReportsMenu(reportsMenuList)))
      .pipe(switchMap(() => customMenuService.prepareCustomMenuList()))
      .pipe(tap(() => this.prepareMenuItems()))
      .pipe(tap(() => this.resetMenuItems$.next(true)));
  }

  @CastResponse(() => MenuItem, { unwrap: '', fallback: '$default' })
  private _load(): Observable<MenuItem[]> {
    return this.staticResourcesService.getMenuList();
  }

  load(prepare: boolean = true): Observable<MenuItem[]> {
    return this._load().pipe(
      map((menuItems) => !this.employeeService.canSeeTeamInbox ? menuItems.filter(x => x.id !== 16) : menuItems),
      tap((menuItems) => this.menuItems = menuItems),
      tap(_ => prepare ? this.prepareMenuItems() : null)
    );
  }

  prepareMenuItems() {
    this.children = new Map<number, MenuItem[]>();
    this.parents = [];
    this.menuItems.forEach(item => {
      return item.parent ? this.addMenuItemToChildren(item) : this.parents.push(item);
    });

    this.getParentChildren(this.parents);

    this.parents.forEach(item => item.getChildrenText());
    this.parents = this.parents.sort((a, b) => {
      return a.itemOrder - b.itemOrder;
    });
  }

  private addMenuItemToChildren(item: MenuItem): void {
    if (!this.children.has(item.parent)) {
      this.children.set(item.parent, []);
    }
    this.children.get(item.parent)?.push(item);
  }

  private getParentChildren(items: MenuItem[]): void {
    items.forEach(item => {
      item.children = this.getChildren(item).sort((a, b) => a.itemOrder - b.itemOrder);
    });
  }

  private getChildren(item: MenuItem): MenuItem[] {
    let items: MenuItem[] = [];
    if (this.children.has(item.id)) {
      items = this.children.get(item.id)!;
    }
    if (items.length) {
      items.forEach(item => {
        item.children = this.getChildren(item);
      });
    }
    return items;
  }

  getMenuByRouteGroup(routeGroupName: string): MenuItem[] {
    return this.menuItems.filter(item => item.group === routeGroupName).sort((a, b) => a.itemOrder - b.itemOrder);
  }

  getMenuItemByLangKey(langKey: keyof ILanguageKeys): MenuItem | undefined {
    return this.menuItems.find(item => item.langKey === langKey);
  }

  getMaxMenuItemId() {
    return Math.max.apply(this, this.menuItems.map(item => item.id));
  }

  getMaxParentMenuSortOrder() {
    return Math.max.apply(this, this.menuItems.filter(x => !x.parent).map(item => item.itemOrder));
  }
}
