import {IKeyValue} from './i-key-value';

export interface ITableOptions {
  ready: boolean,
  columns: string[],
  searchText: string,
  sortingCallbacks: IKeyValue;

  isSelectedRecords(): boolean,

  filterCallback(record: any, searchText: string): any
}
