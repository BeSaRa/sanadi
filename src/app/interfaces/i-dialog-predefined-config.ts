import {IDialogConfig} from './i-dialog-config';
import {ILanguageKeys} from './i-language-keys';


export interface IDialogPredefinedConfig extends IDialogConfig {
  actionBtn?: keyof ILanguageKeys;
  cancelBtn?: keyof ILanguageKeys;
}
