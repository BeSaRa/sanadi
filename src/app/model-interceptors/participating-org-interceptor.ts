import { ParticipantOrg } from './../models/participant-org';
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from '@app/models/admin-result';
import { isValidAdminResult } from '@app/helpers/utils';

export class ParticipatingOrgInterceptor implements IModelInterceptor<ParticipantOrg>{
  caseInterceptor?: IModelInterceptor<ParticipantOrg> | undefined;
  send(model: Partial<ParticipantOrg>): Partial<ParticipantOrg> {
    delete model.searchFields;
    delete model.employeeService;
    delete model.managerDecisionInfo;
    delete model.DisplayedColumns;

      return model;
  }
  receive(model: ParticipantOrg): ParticipantOrg {
    model.managerDecisionInfo = AdminResult.createInstance(
      isValidAdminResult(model.managerDecisionInfo)
        ? model.managerDecisionInfo
        : {}
    );

    return model;
  }
}
