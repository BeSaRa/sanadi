import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { Observable } from "rxjs";

export interface IMenuItem<T> {
  hideLabel?: boolean;
  askChecklist?: boolean;
  class?: string | ((item: T) => string);
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
  disabled?: ((model: T) => boolean) | boolean,
  runBefore?: (model: T) => void,
  runBeforeShouldSuccess?: (model: T) => boolean | Observable<boolean>,
  tooltip?:  keyof ILanguageKeys | ((item: T) => string),
  translatedTooltip?: string
}
