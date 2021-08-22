import {ILanguageKeys} from './i-language-keys';

export interface IGridAction {
  langKey: keyof ILanguageKeys;
  icon: string;
  callback?: ($event: MouseEvent, data?: any) => (void | any);
  show?: (items?: any) => boolean;
  children?: IGridAction[],
  data?: any
}
