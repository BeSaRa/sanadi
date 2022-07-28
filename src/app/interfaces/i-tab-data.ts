import {ILanguageKeys} from '@app/interfaces/i-language-keys';

export interface ITabData {
  name: string,
  langKey: keyof ILanguageKeys,
  index: number,
  /**
   * @description Checks the valid status of tab
   */
  validStatus: () => boolean,
  /**
   * @description Checks if tab can be show/hide
   */
  show?: () => boolean
  /**
   * @description Checks the touched or dirty property of tab when validating
   */
  checkTouchedDirty?: boolean,
  /**
   * @description Checks if the tab is touched or dirty
   */
  isTouchedOrDirty: () => boolean,
  /**
   * @description Get the translated text for given lang key
   * @param item
   */
  getLangText?:(tab: ITabData, item?: any) => string

  [index: string]: any;
}
