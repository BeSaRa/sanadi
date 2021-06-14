import {INames} from '../interfaces/i-names';
import {ModelCrudInterface} from '../interfaces/model-crud-interface';
import {Observable} from 'rxjs';
import {Cloneable} from './cloneable';
import {ISearchFields} from '../interfaces/i-search-fields';
import {searchFunctionType} from '../types/types';
import {BackendGenericService} from '../generics/backend-generic-service';

export abstract class BaseModel<D, S extends BackendGenericService<D>> extends Cloneable<D> implements INames, ModelCrudInterface<D> {
  // @ts-ignore
  id: number;
  arName: string = '';
  enName: string = '';
  updatedBy?: number | undefined;
  updatedOn?: string | undefined;
  clientData?: string | undefined;
  abstract service: S;

  create(): Observable<D> {
    return this.service.create(this as unknown as D);
  };

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  };

  save(): Observable<D> {
    return this.id ? this.update() : this.create();
  };

  update(): Observable<D> {
    return this.service.update(this as unknown as D);
  };

  search(searchText: string): boolean {
    const self = this as unknown as ISearchFields;
    const fields = (this as unknown as ISearchFields).searchFields;
    const keys = Object.keys(fields);
    if (!searchText) {
      return true;
    }
    return keys.some((key) => {
      if (typeof self.searchFields[key] === 'function') {
        const func = self.searchFields[key] as searchFunctionType;
        return func(searchText.trim().toLowerCase());
      } else {
        const field = self.searchFields[key] as string;
        const value = (this as unknown as any)[field] ? ((this as unknown as any)[field] as string) + '' : '';
        return value.toLowerCase().indexOf(searchText.trim().toLowerCase()) !== -1;
      }
    });
  }
}
