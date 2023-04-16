import {WorkArea} from '@models/work-area';
import {CommercialActivity} from '@models/commercial-activity';
import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {TaskDetails} from '@models/task-details';
import {AdminResult} from '@models/admin-result';
import {PartnerApproval} from '@models/partner-approval';
import {FactoryService} from '@app/services/factory.service';
import {PartnerApprovalService} from '@app/services/partner-approval.service';
import {DateUtils} from '@app/helpers/date-utils';
import {IMyDateModel} from 'angular-mydatepicker';
import {BankAccount} from '@app/models/bank-account';
import {ExecutiveManagement} from '@app/models/executive-management';
import {Goal} from '@app/models/goal';
import {ManagementCouncil} from '@app/models/management-council';
import {TargetGroup} from '@app/models/target-group';
import {ContactOfficer} from '@app/models/contact-officer';
import {ApprovalReason} from '@app/models/approval-reason';
import {CommonUtils} from '@app/helpers/common-utils';
import {GoalList} from '@app/models/goal-list';
import {LookupService} from '@services/lookup.service';

export class PartnerApprovalInterceptor implements IModelInterceptor<PartnerApproval> {
  receive(model: PartnerApproval): PartnerApproval {
    model.taskDetails = new TaskDetails().clone(model.taskDetails);
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));
    model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.categoryInfo = AdminResult.createInstance(model.categoryInfo);
    model.countryInfo = AdminResult.createInstance(model.countryInfo);
    model.requestClassificationInfo = AdminResult.createInstance(model.requestClassificationInfo);

    model.managerDecisionInfo = AdminResult.createInstance(model.managerDecisionInfo);
    model.specialistDecisionInfo = AdminResult.createInstance(model.specialistDecisionInfo);
    model.chiefDecisionInfo = AdminResult.createInstance(model.chiefDecisionInfo);
    model.reviewerDepartmentDecisionInfo = AdminResult.createInstance(model.reviewerDepartmentDecisionInfo);
    model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo);

    // model.organizationInfo = AdminResult.createInstance(model.organizationInfo);
    let service = FactoryService.getService<PartnerApprovalService>('PartnerApprovalService');
    model.bankAccountList = model.bankAccountList.map((x) => service.bankAccountInterceptor.receive(new BankAccount().clone(x)));
    model.goalsList = model.goalsList.map((x) => service.goalListInterceptor.receive(new GoalList().clone(x)));
    model.managementCouncilList = model.managementCouncilList.map((x) => service.managementCouncilInterceptor.receive(new ManagementCouncil().clone(x)));
    model.executiveManagementList = model.executiveManagementList.map((x) => service.executiveManagementInterceptor.receive(new ExecutiveManagement().clone(x)));
    model.targetGroupList = model.targetGroupList.map((x) => service.targetGroupInterceptor.receive(new TargetGroup().clone(x)));
    model.contactOfficerList = model.contactOfficerList.map((x) => service.contactOfficerInterceptor.receive(new ContactOfficer().clone(x)));
    model.approvalReasonList = model.approvalReasonList.map((x) => service.approvalReasonInterceptor.receive(new ApprovalReason().clone(x)));
    model.workAreaObjectList = model.workAreaObjectList.map((x) => service.workAreaInterceptor.receive(new WorkArea().clone(x)));
    model.commercialActivitiesList = model.commercialActivitiesList.map((x) => service.commercialActivityInterceptor.receive(new CommercialActivity().clone(x)));
    model.displayGoals = model.goals.map(x => new Goal().clone({goal: x}))
    model.establishmentDateTimestamp = !model.establishmentDate ? null : DateUtils.getTimeStampFromDate(model.establishmentDate);
    model.commercialLicenseEndDateTimestamp = !model.commercialLicenseEndDate ? null : DateUtils.getTimeStampFromDate(model.commercialLicenseEndDate);

    if (!model.headQuarterTypeInfo) {
      const lookupService: LookupService = FactoryService.getService('LookupService');
      model.headQuarterTypeInfo = lookupService.listByCategory.HeadQuarterType.find((item) => item.lookupKey === model.headQuarterType)?.convertToAdminResult() ?? new AdminResult();
    } else {
      model.headQuarterTypeInfo = AdminResult.createInstance(model.headQuarterTypeInfo);
    }

    return model;
  }

  send(model: Partial<PartnerApproval>): Partial<PartnerApproval> {
    if (model.ignoreSendInterceptor) {
      PartnerApprovalInterceptor._deleteBeforeSend(model);
      return model;
    }
    model.region = CommonUtils.isValidValue(model.region) ? model.region : '';
    model.establishmentDate = !model.establishmentDate ? undefined : DateUtils.changeDateFromDatepicker(model.establishmentDate as unknown as IMyDateModel)?.toISOString();
    model.commercialLicenseEndDate = !model.commercialLicenseEndDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.commercialLicenseEndDate as unknown as IMyDateModel
      )?.toISOString();
    let service = FactoryService.getService<PartnerApprovalService>(
      'PartnerApprovalService'
    );
    model.bankAccountList = model.bankAccountList?.map((x: BankAccount) => {
      // @ts-ignore
      delete x.category;
      return service.bankAccountInterceptor.send(x) as BankAccount;
    });
    model.goalsList = model.goalsList?.map((x: GoalList) => {
      return service.goalListInterceptor.send(x) as GoalList;
    });
    model.managementCouncilList = model.managementCouncilList?.map(
      (x: ManagementCouncil) => {
        return service.managementCouncilInterceptor.send(
          x
        ) as ManagementCouncil;
      }
    );
    model.executiveManagementList = model.executiveManagementList?.map(
      (x: ExecutiveManagement) => {
        return service.executiveManagementInterceptor.send(
          x
        ) as ExecutiveManagement;
      }
    );
    model.targetGroupList = model.targetGroupList?.map((x: TargetGroup) => {
      return service.targetGroupInterceptor.send(x) as TargetGroup;
    });
    model.contactOfficerList = model.contactOfficerList?.map(
      (x: ContactOfficer) => {
        return service.contactOfficerInterceptor.send(x) as ContactOfficer;
      }
    );
    model.approvalReasonList = model.approvalReasonList?.map(
      (x: ApprovalReason) => {
        return service.approvalReasonInterceptor.send(x) as ApprovalReason;
      }
    );
    model.commercialActivitiesList = model.commercialActivitiesList?.map(
      (x: CommercialActivity) => {
        return service.commercialActivityInterceptor.send(
          x
        ) as CommercialActivity;
      }
    );
    model.workAreaObjectList = model.workAreaObjectList?.map((x: WorkArea) => {
      return service.workAreaInterceptor.send(x) as WorkArea;
    });

    model.goals = model.displayGoals?.map(x => x.goal) ?? [];


    PartnerApprovalInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<PartnerApproval>): void {
    delete model.ignoreSendInterceptor;

    delete model.service;
    delete model.mapService;
    delete model.defaultLatLng;
    delete model.taskDetails;
    delete model.requestTypeInfo;
    delete model.caseStatusInfo;
    delete model.creatorInfo;
    delete model.ouInfo;
    delete model.employeeService;
    delete model.establishmentDateTimestamp;
    delete model.commercialLicenseEndDateTimestamp;

    delete model.countryInfo;
    delete model.headQuarterTypeInfo;
    delete model.specialistDecisionInfo;
    delete model.chiefDecisionInfo;
    delete model.managerDecisionInfo;
    delete model.reviewerDepartmentDecisionInfo;
    delete model.licenseStatusInfo;
    delete model.requestClassificationInfo;
    delete model.categoryInfo;
    delete model.searchFields;
    delete model.deductionPercent;
    delete model.displayGoals;
    delete model.auditOperation;
  }
}
