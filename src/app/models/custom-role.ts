import { BaseModel } from './base-model';
import { ExternalUserCustomRoleService } from '@services/external-user-custom-role.service';
import { Observable } from 'rxjs';
import { FactoryService } from '@services/factory.service';
import { LangService } from '@services/lang.service';
import { INames } from '@contracts/i-names';
import { CustomRolePermission } from './custom-role-permission';
import { Permission } from './permission';
import { searchFunctionType } from '../types/types';
import { Lookup } from '@app/models/lookup';
import { CustomValidators } from '@app/validators/custom-validators';
import { Validators } from '@angular/forms';
import { CustomRoleInterceptor } from "@app/model-interceptors/custom-role-interceptor";
import { InterceptModel } from "@decorators/intercept-model";
import { CommonStatusEnum } from '@app/enums/common-status.enum';

const interceptor = new CustomRoleInterceptor()

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive
})
export class CustomRole extends BaseModel<CustomRole, ExternalUserCustomRoleService> {
  status: number = CommonStatusEnum.ACTIVATED;
  permissionSet: CustomRolePermission[] = [];
  description: string = '';
  service: ExternalUserCustomRoleService;
  langService: LangService;

  statusInfo!: Lookup;

  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    status: text => !this.statusInfo ? false : this.statusInfo.getName().toLowerCase().indexOf(text) !== -1
  };

  constructor() {
    super();
    this.service = FactoryService.getService('ExternalUserCustomRoleService');
    this.langService = FactoryService.getService('LangService');
  }

  buildForm(controls?: boolean): any {
    const { arName, enName, description, status } = this;
    return {
      arName: controls ? [arName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')
      ]] : arName,
      enName: controls ? [enName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')
      ]] : enName,
      description: controls ? [description, Validators.maxLength(200)] : description,
      status: controls ? [status] : status
    }
  }

  setBasicFormCrossValidations(): any {
    return CustomValidators.validateFieldsStatus(['arName', 'enName', 'description']);
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
    this.status = this.status === CommonStatusEnum.ACTIVATED ? CommonStatusEnum.DEACTIVATED : CommonStatusEnum.ACTIVATED;
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
    const oldPermissionSet = this.prepareCustomRolePermissionByPermissionId();
    this.permissionSet = permissionIds.map(item => {
      return {
        id: oldPermissionSet[item]?.id,
        permissionId: item,
        customRoleId: this.id
      } as CustomRolePermission;
    });
  }

  private prepareCustomRolePermissionByPermissionId(): Record<number, CustomRolePermission> {
    return this.permissionSet
      .reduce<Record<number, CustomRolePermission>>((acc, current) => {
        return { ...acc, [current.permissionId]: current };
      }, {});
  }

  /**
   * @description test desc
   * @param permissions
   * @private
   */
  private setPermissionSetByPermissions(permissions: Permission[]): void {
    const oldPermissionSet = this.prepareCustomRolePermissionByPermissionId();
    this.permissionSet = permissions.map(item => {
      return {
        id: oldPermissionSet[item.id]?.id,
        permissionId: item.id,
        customRoleId: this.id
      } as CustomRolePermission;
    });
  }

}
