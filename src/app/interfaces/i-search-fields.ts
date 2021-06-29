import {searchFunctionType} from '../types/types';

export interface ISearchFields<T> {
  searchFields: { [key: string]: searchFunctionType<T> | string }
}
