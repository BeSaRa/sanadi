import { OrganizationOfficerInterceptor } from '@app/model-interceptors/organization-officer-interceptor';
import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {UrgentJointReliefCampaign} from '@app/models/urgent-joint-relief-campaign';
import {DateUtils} from '@helpers/date-utils';
import {FactoryService} from '@services/factory.service';
import {EmployeeService} from '@services/employee.service';
import {ParticipantOrganization} from '@app/models/participant-organization';
import {AdminResult} from '@app/models/admin-result';
import { ParticipatingOrganizationInterceptor } from './participating-organization-interceptor';
import { OrganizationOfficer } from '@app/models/organization-officer';

const organizationOfficerInterceptor = new OrganizationOfficerInterceptor();
const participatingOrganizationInterceptor = new ParticipatingOrganizationInterceptor();
export class UrgentJointReliefCampaignInterceptor implements IModelInterceptor<UrgentJointReliefCampaign> {
  send(model: Partial<UrgentJointReliefCampaign>): Partial<UrgentJointReliefCampaign> {
    model.licenseStartDate = DateUtils.getDateStringFromDate(model.licenseStartDate);
    model.licenseEndDate = DateUtils.getDateStringFromDate(model.licenseEndDate);
    model.approvalPeriod = +model.approvalPeriod!;
    model.targetAmount = +model.targetAmount!;
    model.participatingOrganizaionList && (model.participatingOrganizaionList = model.participatingOrganizaionList.map(item => {
      item = item.clone({...item});
      return item;
    }));
    model.participatingOrganizaionList && model.participatingOrganizaionList.forEach(y => {
      let x = y as unknown as Partial<ParticipantOrganization>;
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
    delete model.requestTypeInfo;
    return model;
  }

  receive(model: UrgentJointReliefCampaign): UrgentJointReliefCampaign {
    const employeeService = FactoryService.getService('EmployeeService') as EmployeeService;
    model.licenseStartDate = DateUtils.changeDateToDatepicker(model.licenseStartDate);
    model.licenseEndDate = DateUtils.changeDateToDatepicker(model.licenseEndDate);
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));


    // to set donation and workStartDate for login user's organization
    if(employeeService.isExternalUser()) {
      const orgId = employeeService.getProfile()!.id;
      if(model.participatingOrganizaionList.map(x => x.organizationId).includes(orgId)) {
        model.donation = model.participatingOrganizaionList.find(x => x.organizationId == orgId)!.donation!;
        model.workStartDate = DateUtils.changeDateToDatepicker(model.participatingOrganizaionList.find(x => x.organizationId == orgId)!.workStartDate!);
      }
    }
    model.organizaionOfficerList = model.organizaionOfficerList.map(x=>{
      return new OrganizationOfficer().clone(organizationOfficerInterceptor.receive(x));
     })
    model.participatingOrganizaionList = model.participatingOrganizaionList.map(x=>{
      return new ParticipantOrganization().clone(participatingOrganizationInterceptor.receive(x));
     })
    return model;
  }
}
