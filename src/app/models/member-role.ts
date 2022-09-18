import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { MemberRoleInterceptor } from '@app/model-interceptors/member-role-interceptor';
import { FactoryService } from '@app/services/factory.service';
import { MemberRoleService } from '@app/services/member-role.service';
import { AdminResult } from './admin-result';
import { BaseModel } from './base-model';
import { OrgMember } from './org-member';

const interceptor = new MemberRoleInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send,
})
export class MemberRole extends BaseModel<MemberRole, MemberRoleService> {
  service: MemberRoleService = FactoryService.getService('MemberRoleService');
  updatedBy!: number;
  orgType!: number;
  orgId!: number;
  memberId!: number;
  orgMember!: OrgMember;
  roleId!: number;
  roleInfo!: AdminResult;
  id!: number;
}
