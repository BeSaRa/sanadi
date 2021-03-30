import {Injectable} from '@angular/core';
import {MenuItem} from '../models/menu-item';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Generator} from '../decorators/generator';
import {tap} from 'rxjs/operators';
import {MenuItemInterceptor} from '../model-interceptors/menu-item-interceptor';

@Injectable({
  providedIn: 'root'
})
export class MenuItemService {
  menuItems!: MenuItem[];
  parents!: MenuItem[];
  private children: Map<number, MenuItem[]> = new Map<number, MenuItem[]>();

  constructor(public http: HttpClient) {
  }

  @Generator(MenuItem, true, {property: '', interceptReceive: MenuItemInterceptor.receive})
  private _load(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>('MENU.json');
  }

  load(): Observable<MenuItem[]> {
    return this._load().pipe(
      tap((menuItems) => this.menuItems = menuItems),
      tap(_ => this.prepareMenuItems()),
      tap(items => console.log(items))
    );
  }

  private prepareMenuItems() {
    this.children = new Map<number, MenuItem[]>();
    this.parents = [];
    this.menuItems.forEach(item => {
      return item.parent ? this.addMenuItemToChildren(item) : this.parents.push(item);
    });

    this.getParentChildren(this.parents);

    this.parents.forEach(item => item.getChildrenText());
  }

  private addMenuItemToChildren(item: MenuItem): void {
    if (!this.children.has(item.parent)) {
      this.children.set(item.parent, []);
    }
    this.children.get(item.parent)?.push(item);
  }

  private getParentChildren(items: MenuItem[]): void {
    items.forEach(item => {
      item.children = this.getChildren(item);
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
    return this.menuItems.filter(item => item.group === routeGroupName);
  }
}
