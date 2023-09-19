import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { DateUtils } from '@app/helpers/date-utils';
import { OrgMember } from '@app/models/org-member';
import { AdminResult } from '@app/models/admin-result';

export class OrgMemberInterceptor implements IModelInterceptor<OrgMember> {
  receive(model: OrgMember): OrgMember {
    model.joinDate = DateUtils.getDateStringFromDate(model.joinDate);
    model.nationalityInfo && (model.nationalityInfo = AdminResult.createInstance(model.nationalityInfo));
    model.joinDateStamp = !model.joinDate? null :DateUtils.getTimeStampFromDate(model.joinDate);

    return model;
  }

  send(model: Partial<OrgMember>): Partial<OrgMember> {
    delete model.searchFields;
    delete model.nationalityInfo;
    delete model.auditOperation;
    delete model.joinDateStamp;
    return model;
  }
}
