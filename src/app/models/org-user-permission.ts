import { AdminResult } from './admin-result';
import { InterceptModel } from "@decorators/intercept-model";
import { OrgUserPermissionInterceptor } from "@app/model-interceptors/org-user-permission-interceptor";

const { receive, send } = new OrgUserPermissionInterceptor();

@InterceptModel({ send, receive })
export class OrgUserPermission {
  id: number | undefined;
  orgUserId: number | undefined;
  permissionId: number | undefined;
  permisionInfo: AdminResult | undefined;
}
