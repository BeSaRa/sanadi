import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { DateUtils } from '@app/helpers/date-utils';
import { OrgMember } from '@app/models/org-member';

export class OrgMemberInterceptor implements IModelInterceptor<OrgMember> {
  receive(model: OrgMember): OrgMember {
    model.joinDate = DateUtils.getDateStringFromDate(model.joinDate);
    return model;
  }

  send(model: Partial<OrgMember>): Partial<OrgMember> {
    delete model.searchFields
    return model;
  }
}
