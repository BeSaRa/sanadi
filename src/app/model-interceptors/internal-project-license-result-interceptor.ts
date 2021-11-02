import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {InternalProjectLicense} from '@app/models/internal-project-license';
import {AdminResult} from '@app/models/admin-result';
import {CommonUtils} from '@app/helpers/common-utils';
import {isValidAdminResult} from '@app/helpers/utils';

export class InternalProjectLicenseResultInterceptor implements IModelInterceptor<InternalProjectLicense> {
  receive(model: InternalProjectLicense): InternalProjectLicense {
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.domainInfo = AdminResult.createInstance(model.domainInfo);
    model.firstSDGoalInfo = AdminResult.createInstance(model.firstSDGoalInfo);
    model.firstSubDomainInfo = AdminResult.createInstance(model.firstSubDomainInfo);
    model.generalManagerDecisionInfo = AdminResult.createInstance(model.generalManagerDecisionInfo);
    model.secondSDGoalInfo = AdminResult.createInstance(model.secondSDGoalInfo);
    model.secondSubDomainInfo = AdminResult.createInstance(model.secondSubDomainInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo);
    if (CommonUtils.isValidValue(model.targetNationalitiesInfo)) {
      model.targetNationalitiesInfo = model.targetNationalitiesInfo!.map(x => AdminResult.createInstance(isValidAdminResult(x) ? x : {}));
    }
    return model;
  }

  send(model: Partial<InternalProjectLicense>): Partial<InternalProjectLicense> {
    delete model.creatorInfo;
    delete model.domainInfo;
    delete model.firstSDGoalInfo;
    delete model.firstSubDomainInfo;
    delete model.generalManagerDecisionInfo;
    delete model.secondSDGoalInfo;
    delete model.secondSubDomainInfo;
    delete model.ouInfo;
    delete model.licenseStatusInfo;
    delete model.targetNationalitiesInfo;
    return model;
  }
}
