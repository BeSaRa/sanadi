import {IDialogConfig} from './i-dialog-config';
import {ILanguageKeys} from './i-language-keys';


export interface IDialogPredefinedConfig extends IDialogConfig {
  actionBtn: keyof ILanguageKeys;
  cancelBtn: keyof ILanguageKeys;
  thirdBtn: keyof ILanguageKeys;
  showCloseIcon?: boolean;
  hideIcon?: boolean
}

export interface IDialogButton {
  index: number;
  key: string;
  langKey?: keyof ILanguageKeys;
  text?: string;
  cssClass?: string;
}
