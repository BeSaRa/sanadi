import {ILanguageKeys} from '../../../interfaces/i-language-keys';

export interface IMenuItem {
  type: 'action' | 'divider';
  onClick?: (item?: any, ...params: any) => void;
  data?: {
    hideFromViewer?: boolean,
    [index: string]: any
  };
  label?: keyof ILanguageKeys | ((item?: any) => string);
  icon?: string;
  show?: (item?: any) => boolean;
  children?: IMenuItem[]
}
