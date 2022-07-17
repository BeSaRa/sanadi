import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {UrgentJointReliefCampaign} from '@app/models/urgent-joint-relief-campaign';
import {DateUtils} from '@helpers/date-utils';
import {FactoryService} from '@services/factory.service';
import {EmployeeService} from '@services/employee.service';

export class UrgentJointReliefCampaignInterceptor implements IModelInterceptor<UrgentJointReliefCampaign> {
  send(model: Partial<UrgentJointReliefCampaign>): Partial<UrgentJointReliefCampaign> {
    model.licenseStartDate = DateUtils.getDateStringFromDate(model.licenseStartDate);
    model.licenseEndDate = DateUtils.getDateStringFromDate(model.licenseEndDate);
    model.approvalPeriod = +model.approvalPeriod!;
    model.targetAmount = +model.targetAmount!;
    model.participatingOrganizaionList?.forEach(x => {
      x.workStartDate = DateUtils.getDateStringFromDate(x.workStartDate);
      x.donation = +x.donation!;
      delete x.managerDecisionInfo;
      delete x.searchFields;
      delete x.langService;
    });

    model.organizaionOfficerList?.forEach(x => {
      delete x.langService;
      delete (x as any).searchFields;
    });

    delete model.donation;
    delete model.workStartDate;
    return model;
  }

  receive(model: UrgentJointReliefCampaign): UrgentJointReliefCampaign {
    const employeeService = FactoryService.getService('EmployeeService') as EmployeeService;
    model.licenseStartDate = DateUtils.changeDateToDatepicker(model.licenseStartDate);
    model.licenseEndDate = DateUtils.changeDateToDatepicker(model.licenseEndDate);

    // to set donation and workStartDate for login user's organization
    if(employeeService.isExternalUser()) {
      const orgId = employeeService.getOrgUnit()?.id;
      if(model.participatingOrganizaionList.map(x => x.organizationId).includes(orgId)) {
        model.donation = model.participatingOrganizaionList.find(x => x.organizationId == orgId)!.donation!;
        model.workStartDate = DateUtils.changeDateToDatepicker(model.participatingOrganizaionList.find(x => x.organizationId == orgId)!.workStartDate!);
      }
    }
    return model;
  }
}
