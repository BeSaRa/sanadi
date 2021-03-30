import {Pipe, PipeTransform} from '@angular/core';
import {MenuItem} from '../../models/menu-item';
import {LangService} from '../../services/lang.service';

@Pipe({
  name: 'menuItemFilter'
})
export class MenuItemFilterPipe implements PipeTransform {

  constructor(private lang: LangService) {
  }

  transform(items: MenuItem[], searchText: string): MenuItem[] {
    return searchText ? items.filter(item => this.matchSearchText(item, searchText.toLowerCase())) : items;
  }

  private matchSearchText(item: MenuItem, searchText: string): boolean {
    let value = (item[(this.lang.map.lang + 'SearchText') as keyof MenuItem] as string);
    return value.indexOf(searchText) !== -1;
  }
}
