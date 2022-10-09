import {Injectable} from '@angular/core';
import {MenuItem} from '../models/menu-item';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {DomSanitizer} from '@angular/platform-browser';
import {FactoryService} from './factory.service';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {CastResponse} from '@decorators/cast-response';
import {StaticAppResourcesService} from '@services/static-app-resources.service';

@Injectable({
  providedIn: 'root'
})
export class MenuItemService {
  menuItems!: MenuItem[];
  parents!: MenuItem[];
  private children: Map<number, MenuItem[]> = new Map<number, MenuItem[]>();

  constructor(public http: HttpClient, private domSanitizer: DomSanitizer,
              private staticResourcesService: StaticAppResourcesService) {
    FactoryService.registerService('MenuItemService', this);
    FactoryService.registerService('DomSanitizer', domSanitizer);
  }

  @CastResponse(() => MenuItem, { unwrap: '', fallback: '$default' })
  private _load(): Observable<MenuItem[]> {
    // return this.http.get<MenuItem[]>('MENU.json');
    return this.staticResourcesService.getMenuList();
  }

  load(prepare: boolean = true): Observable<MenuItem[]> {
    return this._load().pipe(
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
}
