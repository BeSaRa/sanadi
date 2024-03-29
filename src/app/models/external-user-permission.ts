import { AdminResult } from './admin-result';
import { InterceptModel } from "@decorators/intercept-model";
import { ExternalUserPermissionInterceptor } from "@app/model-interceptors/external-user-permission-interceptor";
import {SearchableCloneable} from '@app/models/searchable-cloneable';

const { receive, send } = new ExternalUserPermissionInterceptor();

@InterceptModel({ send, receive })
export class ExternalUserPermission extends SearchableCloneable<ExternalUserPermission>{
  id: number | undefined;
  externalUserId: number | undefined;
  permissionId: number | undefined;
  permisionInfo?: AdminResult;
  externalUserInfo?: AdminResult;
  status!: number;
  statusDateModified: string = '';
}
