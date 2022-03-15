import {Cloneable} from './cloneable';
import {ISearchFields} from '../interfaces/i-search-fields';
import {ISearchFieldsMap, searchFunctionType} from '../types/types';

export abstract class SearchableCloneable<T> extends Cloneable<T> implements ISearchFields<T> {
  searchFields: ISearchFieldsMap<T> = {};

  search(searchText: string, searchFieldsName: string = 'searchFields'): boolean {
    const self = this as unknown as ISearchFields<any>;
    const fields = (this as unknown as ISearchFields<any>)[searchFieldsName as keyof ISearchFields<any>];
    const keys = Object.keys(fields);
    if (!searchText) {
      return true;
    }
    return keys.some((key) => {
      let searchFields = self[searchFieldsName as keyof ISearchFields<any>];
      if (typeof searchFields[key] === 'function') {
        return (searchFields[key] as searchFunctionType).apply(this, [searchText.trim().toLowerCase(), self]);
      } else {
        const field = searchFields[key] as string;
        const value = (this as unknown as any)[field] ? ((this as unknown as any)[field] as string) + '' : '';
        return value.toLowerCase().indexOf(searchText.trim().toLowerCase()) !== -1;
      }
    });
  }
}
