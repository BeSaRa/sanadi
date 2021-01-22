import {BaseModel} from './base-model';
import {CustomRoleService} from '../services/custom-role.service';
import {Observable} from 'rxjs';
import {FactoryService} from '../services/factory.service';
import {LangService} from '../services/lang.service';
import {INames} from '../interfaces/i-names';
import {CustomRolePermission} from './custom-role-permission';
import {Permission} from './permission';

export class CustomRole extends BaseModel<CustomRole> {
  status: boolean = true;
  permissionSet: CustomRolePermission[] = [];
  description: string = '';
  service: CustomRoleService;
  langService: LangService;

  constructor() {
    super();
    this.service = FactoryService.getService('CustomRoleService');
    this.langService = FactoryService.getService('LangService');
  }

  create(): Observable<CustomRole> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  save(): Observable<CustomRole> {
    return this.id ? this.update() : this.create();
  }

  update(): Observable<CustomRole> {
    return this.service.update(this);
  }

  toggleStatus(): CustomRole {
    this.status = !this.status;
    return this;
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  setPermissionSet(permissions: Permission[] | number[]): void {
    if (typeof permissions[0] === 'number') {
      this.setPermissionSetByIds(permissions as number[]);
    } else {
      this.setPermissionSetByPermissions(permissions as Permission[]);
    }
  }

  private setPermissionSetByIds(permissionIds: number[]): void {
    this.permissionSet = permissionIds.map(item => {
      return {
        permissionId: item,
        customRoleId: this.id
      } as CustomRolePermission;
    });
  }

  /**
   * @description test desc
   * @param permissions
   * @private
   */
  private setPermissionSetByPermissions(permissions: Permission[]): void {
    this.permissionSet = permissions.map(item => {
      return {
        permissionId: item.id,
        customRoleId: this.id
      } as CustomRolePermission;
    });
  }

}
