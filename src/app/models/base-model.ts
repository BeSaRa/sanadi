import {INames} from '../interfaces/i-names';
import {ModelCrudInterface} from '../interfaces/model-crud-interface';
import {Observable} from 'rxjs';
import {Cloneable} from './cloneable';
import {ISearchFields} from '../interfaces/i-search-fields';
import {searchFunctionType} from '../types/types';

export abstract class BaseModel<D> extends Cloneable<D> implements INames, ModelCrudInterface<D> {
  // @ts-ignore
  id: number;
  arName: string = '';
  enName: string = '';
  updatedBy?: number | undefined;
  updatedOn?: string | undefined;
  clientData?: string | undefined;

  abstract create(): Observable<D>;

  abstract delete(): Observable<boolean>;

  abstract save(): Observable<D>;

  abstract update(): Observable<D>;

  search(searchText: string): boolean {
    const self = this as unknown as ISearchFields;
    const fields = (this as unknown as ISearchFields).searchFields;
    const keys = Object.keys(fields);
    if (!searchText) {
      return true;
    }
    return keys.some(key => {
      if (typeof self.searchFields[key] === 'function') {
        const func = self.searchFields[key] as searchFunctionType;
        return func(searchText.trim().toLowerCase());
      } else {
        const field = self.searchFields[key] as keyof BaseModel<D>;
        const value = this[field] ? (this[field] as string) + '' : '';
        return value.toLowerCase().indexOf(searchText.trim().toLowerCase()) !== -1;
      }
    });
  }
}
