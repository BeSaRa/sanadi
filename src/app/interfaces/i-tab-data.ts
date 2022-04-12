import {Observable} from 'rxjs';

export interface ITabData {
  name: string,
  langKey: string,
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
  isTouchedOrDirty: () => boolean
}
