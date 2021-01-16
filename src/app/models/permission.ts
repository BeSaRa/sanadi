import {BaseModel} from './base-model';
import {Observable} from 'rxjs';

export class Permission extends BaseModel<Permission> {
  permissionKey: string | undefined;
  description: string | undefined;
  groupId: number | undefined;
  status: boolean | undefined;

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
}
