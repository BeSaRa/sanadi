import {IKeyValue} from './i-key-value';
import {FilterEventTypes} from '@app/types/types';

export interface ITableOptions {
  ready: boolean,
  columns: string[],
  searchText: string,
  sortingCallbacks: IKeyValue;

  isSelectedRecords(): boolean,

  searchCallback(record: any, searchText: string): any,

  filterCallback(type?: FilterEventTypes): any
}
