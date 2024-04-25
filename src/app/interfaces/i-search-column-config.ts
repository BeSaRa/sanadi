import { ILanguageKeys } from './i-language-keys';
import { AdminLookup } from "@app/models/admin-lookup";
import { Lookup } from "@app/models/lookup";
import { Observable } from 'rxjs';

export interface ISearchColumnConfig {
  key: string;
  label: keyof ILanguageKeys;
  controlType: SearchColumnControlType;
  property: string;
  hide?: boolean;
  maxLength?: number;
  mask?: string;
  selectOptions?: {
    options?: Lookup[] | AdminLookup[] | any[];
    multiple?: boolean;
    labelProperty: string;
    optionValueKey: string;
    options$?: Observable<Lookup[]>|Observable<AdminLookup[]>|Observable<any[]>;
  }
}

export type SearchColumnControlType = 'text' | 'select' | 'empty' | 'search_actions';
export type SearchColumnConfigMap = { [key: string]: ISearchColumnConfig };
export type SearchColumnEventType = 'filter' | 'clear';
