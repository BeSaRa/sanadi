import {ILanguageKeys} from '@app/interfaces/i-language-keys';

export interface IMenuItem<T> {
  name?: string;
  type: 'action' | 'divider';
  onClick?: (item: T, ...params: any) => void;
  data?: {
    hideFromViewer?: boolean | ((loadedModel?: any, model?: T) => boolean),
    hideFromContext?: boolean | ((item: T) => boolean),
    [index: string]: any
  };
  label?: keyof ILanguageKeys | ((item: T) => string);
  icon?: string;
  show?: (item: T) => boolean;
  children?: IMenuItem<T>[];
  displayInGrid?: ((model: T) => boolean) | boolean,
  translatedLabel?: string;
}
