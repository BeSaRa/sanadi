import {searchFunctionType} from '../types/types';

export interface ISearchFields {
  searchFields: { [key: string]: searchFunctionType | string }
}
