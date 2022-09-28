import { DateUtils } from '@app/helpers/date-utils';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { CharityDecision } from '@app/models/charity-decision';
import { CharityOrganizationUpdate } from '@app/models/charity-organization-update';
import { CharityReport } from '@app/models/charity-report';
import { OrgMember } from '@app/models/org-member';
import { RealBeneficiary } from '@app/models/real-beneficiary';
import { CharityDecisionInterceptor } from './charity-Decision-interceptor';
import { CharityReportInterceptor } from './charity-report-interceptor';
import { OrgMemberInterceptor } from './org-member-interceptor';
import { RealBeneficiaryInterceptor } from './real-beneficiary-interceptors';

export class CharityOrganizationUpdateInterceptor implements IModelInterceptor<CharityOrganizationUpdate> {
  caseInterceptor?: IModelInterceptor<CharityOrganizationUpdate> | undefined;
  send(model: Partial<CharityOrganizationUpdate>): Partial<CharityOrganizationUpdate> {
    const charityReportInterceptor = new CharityReportInterceptor();
    const charityDecisionInterceptor = new CharityDecisionInterceptor();
    const realBeneficiaryInterceptor = new RealBeneficiaryInterceptor();
    const membersInterceptor = new OrgMemberInterceptor();
    model.realBeneficiaryList = model.realBeneficiaryList?.map(e => realBeneficiaryInterceptor.send(e) as RealBeneficiary);
    model.boardMemberList = model.boardMemberList?.map(e => membersInterceptor.send(e) as OrgMember);
    model.authorizedSignatoryMemberList = model.authorizedSignatoryMemberList?.map(e => membersInterceptor.send(e) as OrgMember);
    model.founderMemberList = model.founderMemberList?.map(e => membersInterceptor.send(e) as OrgMember);
    model.generalAssemblyMemberList = model.generalAssemblyMemberList?.map(e => membersInterceptor.send(e) as OrgMember);
    model.currentExecutiveManagementList = model.currentExecutiveManagementList?.map(e => membersInterceptor.send(e) as OrgMember);

    model.riskReportList = model.riskReportList?.map(e => charityReportInterceptor.send(e) as CharityReport);
    model.coordinationSupportReport = model.coordinationSupportReport?.map(e => charityReportInterceptor.send(e) as CharityReport);
    model.incomingReportList = model.incomingReportList?.map(e => charityReportInterceptor.send(e) as CharityReport);
    model.incomingDecisionList = model.incomingDecisionList?.map(e => charityDecisionInterceptor.send(e) as CharityDecision);
    model.outgoingDecisionList = model.outgoingDecisionList?.map(e => charityDecisionInterceptor.send(e) as CharityDecision);
    (model.lastUpdateDate && (model.lastUpdateDate = DateUtils.getDateStringFromDate(model.lastUpdateDate)));
    (model.firstReleaseDate && (model.firstReleaseDate = DateUtils.getDateStringFromDate(model.firstReleaseDate)))
    return model;
  }
  receive(model: CharityOrganizationUpdate): CharityOrganizationUpdate {
    const charityReportInterceptor = new CharityReportInterceptor();
    const charityDecisionInterceptor = new CharityDecisionInterceptor();
    const realBeneficiaryInterceptor = new RealBeneficiaryInterceptor();
    const membersInterceptor = new OrgMemberInterceptor();

    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.realBeneficiaryList = model.realBeneficiaryList?.map(e => realBeneficiaryInterceptor.receive(e) as RealBeneficiary);
    model.boardMemberList = model.boardMemberList?.map(e => membersInterceptor.receive(e) as OrgMember);
    model.authorizedSignatoryMemberList = model.authorizedSignatoryMemberList?.map(e => membersInterceptor.receive(e) as OrgMember);
    model.founderMemberList = model.founderMemberList?.map(e => membersInterceptor.receive(e) as OrgMember);
    model.generalAssemblyMemberList = model.generalAssemblyMemberList?.map(e => membersInterceptor.receive(e) as OrgMember);
    model.currentExecutiveManagementList = model.currentExecutiveManagementList?.map(e => membersInterceptor.receive(e) as OrgMember);

    model.riskReportList = model.riskReportList?.map(e => charityReportInterceptor.receive(e) as CharityReport);
    model.coordinationSupportReport = model.coordinationSupportReport?.map(e => charityReportInterceptor.receive(e) as CharityReport);
    model.incomingReportList = model.incomingReportList?.map(e => charityReportInterceptor.receive(e) as CharityReport);
    model.incomingDecisionList = model.incomingDecisionList?.map(e => charityDecisionInterceptor.receive(e) as CharityDecision);
    model.outgoingDecisionList = model.outgoingDecisionList?.map(e => charityDecisionInterceptor.receive(e) as CharityDecision);
    return model;
  }
}
