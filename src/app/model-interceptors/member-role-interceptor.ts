import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { MemberRole } from '@app/models/member-role';

export class MemberRoleInterceptor implements IModelInterceptor<MemberRole>{
  caseInterceptor?: IModelInterceptor<MemberRole> | undefined;
  send(model: Partial<MemberRole>): Partial<MemberRole> {
    return model;
  }
  receive(model: MemberRole): MemberRole {
    return model;
  }
}
