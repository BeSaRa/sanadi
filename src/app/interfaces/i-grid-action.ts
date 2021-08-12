import {ILanguageKeys} from './i-language-keys';

export interface IGridAction {
  langKey: keyof ILanguageKeys;
  icon: string;
  callback: any;
  show?: (items?: any) => boolean;
}
