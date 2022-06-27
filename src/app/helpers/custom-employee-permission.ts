import {MenuItem} from "@app/models/menu-item";
import {EmployeeService} from "@app/services/employee.service";
import {ILanguageKeys} from "@app/interfaces/i-language-keys";

export class CustomEmployeePermission {
  static customPermissions: Map<keyof ILanguageKeys, (employee: EmployeeService, item: MenuItem,) => boolean> = new Map<keyof ILanguageKeys, (employee: EmployeeService, item: MenuItem) => boolean>();


  registerCustomPermission(langKey: keyof ILanguageKeys, callback: (employee: EmployeeService, item: MenuItem) => boolean): CustomEmployeePermission {
    // if (CustomEmployeePermission.customPermissions.has(langKey)) {
    //   throw Error('you have same menu permission before:' + langKey)
    // }
    CustomEmployeePermission.customPermissions.set(langKey, callback);
    return this;
  }

  static getCustomPermission(langKey: keyof ILanguageKeys): (employee: EmployeeService, item: MenuItem) => boolean {
    return CustomEmployeePermission.customPermissions.get(langKey)!;
  }

  static hasCustomPermission(langKey: keyof ILanguageKeys): boolean {
    return CustomEmployeePermission.customPermissions.has(langKey);
  }


}
