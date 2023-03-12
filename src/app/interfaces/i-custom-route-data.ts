import {CaseTypes} from '@app/enums/case-types.enum';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {DynamicMenuRouteTypeEnum} from '@app/enums/dynamic-menu-route-type.enum';

export interface ICustomRouteData {
  /**
   * @description Permission key to be checked for authorizing the  current user.
   * Used with permission guard and services guard.
   */
  permissionKey: string | string[] | null,
  /**
   * @description Permission group name [containing list of permission keys] to be checked for authorizing current user.
   * Used with permission guard and services guard.
   */
  permissionGroup: string | null,
  /**
   * @description Permission group name [containing list of permission keys] to be checked for authorizing current user.
   * Used with permission guard and services guard.
   */
  configPermissionGroup: string | null,
  /**
   * @description Check if all permissions should be checked or any matching permission for authorizing current user.
   * Used with permission guard and services guard.
   */
  checkAnyPermission: boolean,
  /**
   * @description Name of the component to be rendered.
   * Used in e-services-wrapper component.
   */
  render?: string;
  /**
   * @description CaseType of component to be rendered.
   * Used in pre validate data guard.
   */
  caseType?: CaseTypes,
  /**
   * @description Failure message language key.
   * Used in pre validate data guard.
   */
  preValidateFailMsgKey?: keyof ILanguageKeys,
  /**
   * @description Cookie key which will contain some data and will be checked in component.
   * Used with cookie guard.
   */
  cookieKey?: string;
  /**
   * @description Function to validate the cookie value.
   * Used with cookie guard.
   */
  validateCookie:(value: any) => boolean
  /**
   * @description Dynamic menu type (module/parent/parent-details/child)
   * Used with DynamicMenuGuard
   */
  dynamicMenuRouteType: DynamicMenuRouteTypeEnum
}
