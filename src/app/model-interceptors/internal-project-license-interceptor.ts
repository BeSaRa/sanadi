import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {InternalProjectLicense} from '@app/models/internal-project-license';
import {AdminResult} from '@app/models/admin-result';
import {isValidAdminResult} from '@app/helpers/utils';
import {CommonUtils} from '@app/helpers/common-utils';
import {DateUtils} from '@app/helpers/date-utils';
import {IMyDateModel} from 'angular-mydatepicker';
import {FactoryService} from '@app/services/factory.service';
import {InternalProjectLicenseService} from '@app/services/internal-project-license.service';
import {ProjectComponent} from '@app/models/project-component';
import {TaskDetails} from '@app/models/task-details';

export class InternalProjectLicenseInterceptor implements IModelInterceptor<InternalProjectLicense> {
  receive(model: InternalProjectLicense): InternalProjectLicense {
    model.taskDetails = (new TaskDetails()).clone(model.taskDetails);
    // if targetedNationalities = null, set it to empty array
    if (!CommonUtils.isValidValue(model.targetedNationalities)) {
      model.targetedNationalities = [];
      model.targetNationalitiesInfo = [];
    }
    if (CommonUtils.isValidValue(model.targetNationalitiesInfo)) {
      model.targetNationalitiesInfo = model.targetNationalitiesInfo!.map(x => AdminResult.createInstance(isValidAdminResult(x) ? x : {}));
    }

    let internalProjectLicenseService = FactoryService.getService('InternalProjectLicenseService') as InternalProjectLicenseService;
    if (model.componentList && model.componentList.length > 0) {
      model.componentList = model.componentList.map(x => internalProjectLicenseService.projectComponentInterceptor.receive(new ProjectComponent().clone(x)));
    }

    model.ouInfo = AdminResult.createInstance(isValidAdminResult(model.ouInfo) ? model.ouInfo : {});
    model.caseStatusInfo = AdminResult.createInstance(isValidAdminResult(model.caseStatusInfo) ? model.caseStatusInfo : {});
    model.creatorInfo = AdminResult.createInstance(isValidAdminResult(model.creatorInfo) ? model.creatorInfo : {});

    model.specialistDecisionInfo = AdminResult.createInstance(isValidAdminResult(model.specialistDecisionInfo) ? model.specialistDecisionInfo : {});
    model.chiefDecisionInfo = AdminResult.createInstance(isValidAdminResult(model.chiefDecisionInfo) ? model.chiefDecisionInfo : {});
    model.managerDecisionInfo = AdminResult.createInstance(isValidAdminResult(model.managerDecisionInfo) ? model.managerDecisionInfo : {});
    model.generalManagerDecisionInfo = AdminResult.createInstance(isValidAdminResult(model.generalManagerDecisionInfo) ? model.generalManagerDecisionInfo : {});
    model.reviewerDepartmentDecisionInfo = AdminResult.createInstance(isValidAdminResult(model.reviewerDepartmentDecisionInfo) ? model.reviewerDepartmentDecisionInfo : {});

    model.licenseStatusInfo = AdminResult.createInstance(isValidAdminResult(model.licenseStatusInfo) ? model.licenseStatusInfo : {});
    model.projectTypeInfo = AdminResult.createInstance(isValidAdminResult(model.projectTypeInfo) ? model.projectTypeInfo : {});
    model.domainInfo = AdminResult.createInstance(isValidAdminResult(model.domainInfo) ? model.domainInfo : {});
    model.firstSubDomainInfo = AdminResult.createInstance(isValidAdminResult(model.firstSubDomainInfo) ? model.firstSubDomainInfo : {});
    model.secondSubDomainInfo = AdminResult.createInstance(isValidAdminResult(model.secondSubDomainInfo) ? model.secondSubDomainInfo : {});
    model.firstSDGoalInfo = AdminResult.createInstance(isValidAdminResult(model.firstSDGoalInfo) ? model.firstSDGoalInfo : {});
    model.secondSDGoalInfo = AdminResult.createInstance(isValidAdminResult(model.secondSDGoalInfo) ? model.secondSDGoalInfo : {});
    model.thirdSDGoalInfo = AdminResult.createInstance(isValidAdminResult(model.thirdSDGoalInfo) ? model.thirdSDGoalInfo : {});

    model.projectNameInfo = AdminResult.createInstance({arName: model.arName, enName: model.enName});

    return model;
  }

  send(model: Partial<InternalProjectLicense>): Partial<InternalProjectLicense> {
    // if targetedNationalities = null || [], set it to null
    if (!model.targetedNationalities || model.targetedNationalities.length === 0) {
      model.targetedNationalities = null;
    }

    model.expectedImpactDate = !model.expectedImpactDate ? '' : DateUtils.changeDateFromDatepicker(model.expectedImpactDate as unknown as IMyDateModel)?.toISOString();

    let internalProjectLicenseService = FactoryService.getService('InternalProjectLicenseService') as InternalProjectLicenseService;
    if (model.componentList && model.componentList.length > 0) {
      model.componentList = model.componentList.map((x: ProjectComponent) => {
        return internalProjectLicenseService.projectComponentInterceptor.send(x) as ProjectComponent;
      })
    }

    delete model.service;
    delete model.employeeService;
    delete model.taskDetails;
    delete model.caseStatusInfo;
    delete model.creatorInfo;
    delete model.projectNameInfo;
    delete model.categoryInfo;
    delete model.ouInfo;
    delete model.specialistDecisionInfo;
    delete model.chiefDecisionInfo;
    delete model.managerDecisionInfo;
    delete model.generalManagerDecisionInfo;
    delete model.reviewerDepartmentDecisionInfo;
    delete model.licenseStatusInfo;
    delete model.projectTypeInfo;
    delete model.domainInfo;
    delete model.firstSubDomainInfo;
    delete model.secondSubDomainInfo;
    delete model.firstSDGoalInfo;
    delete model.secondSDGoalInfo;
    delete model.thirdSDGoalInfo;
    delete model.targetNationalitiesInfo;

    return model;
  }

}
