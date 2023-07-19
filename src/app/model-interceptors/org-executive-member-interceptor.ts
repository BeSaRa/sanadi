import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { DateUtils } from '@app/helpers/date-utils';
import { AdminResult } from '@app/models/admin-result';
import { OrgExecutiveMember } from '@app/models/org-executive-member';

export class OrgExecutiveMemberInterceptor implements IModelInterceptor<OrgExecutiveMember> {
  receive(model: OrgExecutiveMember): OrgExecutiveMember {
    model.joinDate = DateUtils.getDateStringFromDate(model.joinDate);
    model.nationalityInfo && (model.nationalityInfo = AdminResult.createInstance(model.nationalityInfo));
    model.joinDateStamp = !model.joinDate? null :DateUtils.getTimeStampFromDate(model.joinDate);

    return model;
  }

  send(model: Partial<OrgExecutiveMember>): Partial<OrgExecutiveMember> {
    delete model.searchFields;
    delete model.nationalityInfo;
    delete model.auditOperation;
    delete model.joinDateStamp;
    return model;
  }
}
