import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {CollectorLicense} from '@app/license-models/collector-license';
import {AdminResult} from '@app/models/admin-result';
import {DateUtils} from '@app/helpers/date-utils';

export class CollectorLicenseInterceptor implements IModelInterceptor<CollectorLicense> {
    send(model: Partial<CollectorLicense>): Partial<CollectorLicense> {
        return model;
    }
    receive(model: CollectorLicense): CollectorLicense {
      model.caseStatusInfo && (model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo));
      model.chiefDecisionInfo && (model.chiefDecisionInfo = AdminResult.createInstance(model.chiefDecisionInfo));
      model.collectorTypeInfo && (model.collectorTypeInfo = AdminResult.createInstance(model.collectorTypeInfo));
      model.creatorInfo && (model.creatorInfo = AdminResult.createInstance(model.creatorInfo));
      model.genderInfo && (model.genderInfo = AdminResult.createInstance(model.genderInfo));
      model.licenseDurationTypeInfo && (model.licenseDurationTypeInfo = AdminResult.createInstance(model.licenseDurationTypeInfo));
      model.licenseStatusInfo && (model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo));
      model.managerDecisionInfo && (model.managerDecisionInfo = AdminResult.createInstance(model.managerDecisionInfo));
      model.nationalityInfo && (model.nationalityInfo = AdminResult.createInstance(model.nationalityInfo));
      model.orgInfo && (model.orgInfo = AdminResult.createInstance(model.orgInfo));
      model.relationshipInfo && (model.relationshipInfo = AdminResult.createInstance(model.relationshipInfo));
      model.ouInfo && (model.ouInfo = AdminResult.createInstance(model.ouInfo));
      model.requestClassificationInfo && (model.requestClassificationInfo = AdminResult.createInstance(model.requestClassificationInfo));
      model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));
      model.reviewerDepartmentDecisionInfo && (model.reviewerDepartmentDecisionInfo = AdminResult.createInstance(model.reviewerDepartmentDecisionInfo));
      model.secondSpecialistDecisionInfo && (model.secondSpecialistDecisionInfo = AdminResult.createInstance(model.secondSpecialistDecisionInfo));
      model.specialistDecisionInfo && (model.specialistDecisionInfo = AdminResult.createInstance(model.specialistDecisionInfo));
      model.licenseEndDate = DateUtils.changeDateToDatepicker(model.licenseEndDate);
      return model;
    }
}
