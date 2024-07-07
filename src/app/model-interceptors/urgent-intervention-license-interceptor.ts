import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {UrgentInterventionLicense} from '@app/models/urgent-intervention-license';
import {AdminResult} from '@app/models/admin-result';
import {DomainTypes} from '@app/enums/domain-types';
import {DateUtils} from '@app/helpers/date-utils';
import {IMyDateModel} from '@nodro7/angular-mydatepicker';

export class UrgentInterventionLicenseInterceptor implements IModelInterceptor<UrgentInterventionLicense> {
  receive(model: UrgentInterventionLicense): UrgentInterventionLicense {
    model.ouInfo && (model.ouInfo = AdminResult.createInstance(model.ouInfo));
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));
    model.caseStatusInfo && (model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo));
    model.creatorInfo && (model.creatorInfo = AdminResult.createInstance(model.creatorInfo));
    model.specialistDecisionInfo && (model.specialistDecisionInfo = AdminResult.createInstance(model.specialistDecisionInfo));
    model.secondSpecialistDecisionInfo && (model.secondSpecialistDecisionInfo = AdminResult.createInstance(model.secondSpecialistDecisionInfo));
    model.chiefDecisionInfo && (model.chiefDecisionInfo = AdminResult.createInstance(model.chiefDecisionInfo));
    model.managerDecisionInfo && (model.managerDecisionInfo = AdminResult.createInstance(model.managerDecisionInfo));
    model.generalManagerDecisionInfo && (model.generalManagerDecisionInfo = AdminResult.createInstance(model.generalManagerDecisionInfo));
    model.reviewerDepartmentDecisionInfo && (model.reviewerDepartmentDecisionInfo = AdminResult.createInstance(model.reviewerDepartmentDecisionInfo));
    model.licenseStatusInfo && (model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo));
    model.mainUNOCHAInfo && (model.mainUNOCHAInfo = AdminResult.createInstance(model.mainUNOCHAInfo));
    model.currencyInfo && (model.currencyInfo = AdminResult.createInstance(model.currencyInfo));
    model.domainInfo && (model.domainInfo = AdminResult.createInstance(model.domainInfo));
    model.projectNameInfo = AdminResult.createInstance({arName: model.arName, enName: model.enName});
    model.licenseStartDateString = DateUtils.getDateStringFromDate(model.licenseStartDate);
    model.licenseStartDateTimestamp = DateUtils.getTimeStampFromDate(model.licenseStartDate!);
    return model;
  }

  send(model: Partial<UrgentInterventionLicense>): Partial<UrgentInterventionLicense> {
    UrgentInterventionLicenseInterceptor._deleteBeforeSend(model);
    model.domain = model.domain ?? DomainTypes.HUMANITARIAN;
    model.licenseStartDate = !model.licenseStartDate ? undefined : DateUtils.changeDateFromDatepicker(model.licenseStartDate as unknown as IMyDateModel)?.toISOString();
    return model;
  }

  private static _deleteBeforeSend(model: Partial<UrgentInterventionLicense>): void {
    delete model.ouInfo;
    delete model.requestTypeInfo;
    delete model.caseStatusInfo;
    delete model.managerDecisionInfo;
    delete model.reviewerDepartmentDecisionInfo;
    delete model.licenseStatusInfo;
    delete model.specialistDecisionInfo;
    delete model.secondSpecialistDecisionInfo;
    delete model.chiefDecisionInfo;
    delete model.generalManagerDecisionInfo;
    delete model.domainInfo;
    delete model.mainUNOCHAInfo;
    delete model.currencyInfo;
    delete model.projectNameInfo;
    delete model.licenseStartDateString;
    delete model.licenseStartDateTimestamp;
  }

}
