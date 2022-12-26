import {BaseModel} from './base-model';
import {Observable} from 'rxjs';
import {FactoryService} from '@services/factory.service';
import {LangService} from '@services/lang.service';
import {INames} from '@contracts/i-names';
import {AdminResult} from '@app/models/admin-result';
import {PermissionCategoryEnum} from '@app/enums/permission-category.enum';

export class Permission extends BaseModel<Permission, any> {
  service: any;
  permissionKey!: string;
  description: string | undefined;
  groupId!: number;
  status: boolean | undefined;
  category!: number;

  categoryInfo!: AdminResult;

  private langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  create(): Observable<Permission> {
    throw new Error('No Impl');
  }

  delete(): Observable<boolean> {
    throw new Error('No Impl');
  }

  save(): Observable<Permission> {
    throw new Error('No Impl');
  }

  update(): Observable<Permission> {
    throw new Error('No Impl');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  isExternalPermissionCategory(): boolean {
    return this.category === PermissionCategoryEnum.INTERNAL;
  }

  isInternalPermissionCategory(): boolean {
    return this.category === PermissionCategoryEnum.EXTERNAL;
  }

  isAllPermissionCategory(): boolean {
    return this.category === PermissionCategoryEnum.ALL;
  }

  convertToAdminResult(): AdminResult {
    return AdminResult.createInstance({enName: this.enName, arName: this.arName, id: this.id})
  }
}
