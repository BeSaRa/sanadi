import {BaseModel} from './base-model';

export class Permission extends BaseModel {
  permissionKey: string | undefined;
  description: string | undefined;
  groupId: number | undefined;
  status: boolean | undefined;

  create(): void {
  }

  delete(): void {
  }

  save(): void {
  }

  update(): void {
  }
}
