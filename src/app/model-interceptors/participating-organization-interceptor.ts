import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from '@app/models/admin-result';
import { isValidAdminResult } from '@app/helpers/utils';
import { ParticipantOrganization } from "@app/models/participant-organization";
import { DateUtils } from "@app/helpers/date-utils";

export class ParticipatingOrganizationInterceptor implements IModelInterceptor<ParticipantOrganization>{
  caseInterceptor?: IModelInterceptor<ParticipantOrganization> | undefined;
  send(model: Partial<ParticipantOrganization>): Partial<ParticipantOrganization> {
    model.workStartDate = DateUtils.getDateStringFromDate(model.workStartDate);
    model.donation = +model.donation!;
    delete model.managerDecisionInfo  ;
    delete model.searchFields;
    delete model.langService;
    delete model.searchFields;
    delete model.managerDecisionInfo;

      return model;
  }
  receive(model: ParticipantOrganization): ParticipantOrganization {
    model.managerDecisionInfo = AdminResult.createInstance(
      isValidAdminResult(model.managerDecisionInfo)
        ? model.managerDecisionInfo
        : {}
    );

    return model;
  }
}
