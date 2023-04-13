import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { DateUtils } from '@app/helpers/date-utils';
import { OrgMember } from '@app/models/org-member';
import { AdminResult } from '@app/models/admin-result';

export class OrgMemberInterceptor implements IModelInterceptor<OrgMember> {
  receive(model: OrgMember): OrgMember {
    model.joinDate = DateUtils.getDateStringFromDate(model.joinDate);
    model.jobTitleInfo = AdminResult.createInstance(model.jobTitleInfo);
    return model;
  }

  send(model: Partial<OrgMember>): Partial<OrgMember> {
    delete model.searchFields;
    delete model.jobTitleInfo;
    delete model.auditOperation;
    return model;
  }
}
