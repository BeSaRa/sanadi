import {BaseModel} from './base-model';
import {FactoryService} from '@services/factory.service';
import {LangService} from '@services/lang.service';
import {INames} from '@contracts/i-names';
import {AdminResult} from '@app/models/admin-result';
import {PermissionCategoryEnum} from '@app/enums/permission-category.enum';
import {InterceptModel} from '@app/decorators/decorators/intercept-model';
import {PermissionInterceptor} from '@app/model-interceptors/permission-interceptor';
import {CustomValidators} from '@app/validators/custom-validators';
import {PermissionService} from '@app/services/permission.service';
import {ISearchFieldsMap} from "@app/types/types";
import {normalSearchFields} from "@helpers/normal-search-fields";
import {infoSearchFields} from "@helpers/info-search-fields";

const interceptor: PermissionInterceptor = new PermissionInterceptor()

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class Permission extends BaseModel<Permission, any> {
  permissionKey!: string;
  description: string | undefined;
  groupId!: number;
  status: boolean | undefined;
  category!: number;

  categoryInfo!: AdminResult;
  groupInfo!: AdminResult;

  private langService: LangService;
  service!: PermissionService;

  searchFields: ISearchFieldsMap<Permission> = {
    ...normalSearchFields(['arName', 'enName']),
    ...infoSearchFields(['categoryInfo', 'groupInfo'])
  }

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('PermissionService')

  }


  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  isExternalPermissionCategory(): boolean {
    return this.category === PermissionCategoryEnum.EXTERNAL;
  }

  isInternalPermissionCategory(): boolean {
    return this.category === PermissionCategoryEnum.INTERNAL;
  }

  isAllPermissionCategory(): boolean {
    return this.category === PermissionCategoryEnum.ALL;
  }

  convertToAdminResult(): AdminResult {
    return AdminResult.createInstance({enName: this.enName, arName: this.arName, id: this.id})
  }

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      description,
      groupId,
      category
    } = this;
    return {
      arName: controls ? [arName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM_ONE_AR')
      ]] : arName,
      enName: controls ? [enName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')
      ]] : enName,
      description: controls ? [description, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : description,
      groupId: controls ? [groupId, [CustomValidators.required]] : groupId,
      category: controls ? [category, [CustomValidators.required]] : category
    }
  }
}
