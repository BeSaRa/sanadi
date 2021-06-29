import {Cloneable} from './cloneable';
import {ISearchFields} from '../interfaces/i-search-fields';
import {ISearchFieldsMap, searchFunctionType} from '../types/types';

export abstract class SearchableCloneable<T> extends Cloneable<T> implements ISearchFields<T> {
  searchFields: ISearchFieldsMap<T> = {};

  search(searchText: string): boolean {
    const self = this as unknown as ISearchFields<any>;
    const fields = (this as unknown as ISearchFields<any>).searchFields;
    const keys = Object.keys(fields);
    if (!searchText) {
      return true;
    }
    return keys.some((key) => {
      if (typeof self.searchFields[key] === 'function') {
        return (self.searchFields[key] as searchFunctionType).apply(this, [searchText.trim().toLowerCase(), self]);
      } else {
        const field = self.searchFields[key] as string;
        const value = (this as unknown as any)[field] ? ((this as unknown as any)[field] as string) + '' : '';
        return value.toLowerCase().indexOf(searchText.trim().toLowerCase()) !== -1;
      }
    });
  }
}
