import {ILanguageKeys} from '../../../interfaces/i-language-keys';

export interface IMenuItem {
  onClick: (item?: any) => void;
  label: keyof ILanguageKeys | ((item?: any) => string);
  icon?: string;
  show?: (item?: any) => boolean;
  children?: IMenuItem[]
}
