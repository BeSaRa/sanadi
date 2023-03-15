import { ILanguageKeys } from './i-language-keys';
import { AdminLookup } from "@app/models/admin-lookup";
import { Lookup } from "@app/models/lookup";

export interface ISearchColumnConfig {
  key: string;
  label: keyof ILanguageKeys;
  controlType: ColumnControlType;
  property: string;
  selectOptions?: {
    options: Lookup[] | AdminLookup[] | any[];
    multiple?: boolean;
    lableProperty: string;
    optionValueKey: string;
  }
}

export type ColumnControlType = 'text' | 'select';
