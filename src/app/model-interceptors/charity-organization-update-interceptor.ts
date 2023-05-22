import { DateUtils } from '@app/helpers/date-utils';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { Bylaw } from '@app/models/bylaw';
import { CharityBranch } from '@app/models/charity-branch';
import { CharityDecision } from '@app/models/charity-decision';
import { CharityOrganizationUpdate } from '@app/models/charity-organization-update';
import { CharityReport } from '@app/models/charity-report';
import { ForeignAidClassification } from '@app/models/foreign-aid-classification';
import { OrgMember } from '@app/models/org-member';
import { OrganizationOfficer } from '@app/models/organization-officer';
import { RealBeneficiary } from '@app/models/real-beneficiary';
import { WorkArea } from '@app/models/work-area';
import { ByLawInterceptor } from './bylaw-interceptor';
import { CharityBranchInterceptor } from './charity-branch-interceptor';
import { CharityDecisionInterceptor } from './charity-Decision-interceptor';
import { CharityReportInterceptor } from './charity-report-interceptor';
import { ForeignAidClassificationInterceptor } from './foreign-aid-classification-interceptor';
import { OrgMemberInterceptor } from './org-member-interceptor';
import { OrganizationOfficerInterceptor } from './organization-officer-interceptor';
import { RealBeneficiaryInterceptor } from './real-beneficiary-interceptors';
import { WorkAreaInterceptor } from './workarea-interceptor';

const bylawInterceptor = new ByLawInterceptor();
const charityReportInterceptor = new CharityReportInterceptor();
const charityDecisionInterceptor = new CharityDecisionInterceptor();
const realBeneficiaryInterceptor = new RealBeneficiaryInterceptor();
const membersInterceptor = new OrgMemberInterceptor();
const organizationOfficer = new OrganizationOfficerInterceptor();
const foreignAidClassificationInterceptor = new ForeignAidClassificationInterceptor();
const charityBranchInterceptor = new CharityBranchInterceptor();
const workAreaInterceptor = new WorkAreaInterceptor();

export class CharityOrganizationUpdateInterceptor implements IModelInterceptor<CharityOrganizationUpdate> {
  caseInterceptor?: IModelInterceptor<CharityOrganizationUpdate> | undefined;
  send(model: Partial<CharityOrganizationUpdate>): Partial<CharityOrganizationUpdate> {
    model.registrationAuthority = model.registrationAuthorityInfo?.id;
    delete model.service;
    delete model.followUpService;
    delete model.lookupService;
    delete model.activityTypeInfo;
    delete model.registrationAuthorityInfo;
    delete model.publishDateStamp;
    delete model.registrationDateStamp;
    delete model.establishmentDateStamp;
    delete model.firstReleaseDateStamp;
    delete model.lastUpdateDateStamp;

    model.workAreaObjectList = model.workAreaObjectList?.map(e => workAreaInterceptor.send(e) as WorkArea);
    model.charityBranchList = model.charityBranchList?.map(e => charityBranchInterceptor.send(e) as CharityBranch);
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
    model.complianceOfficerList = model.complianceOfficerList?.map(e => organizationOfficer.send(e) as OrganizationOfficer);
    model.wFClassificationList = model.wFClassificationList?.map(e => foreignAidClassificationInterceptor.send(e) as ForeignAidClassification);
    model.charityContactOfficerList = model.charityContactOfficerList?.map(e => organizationOfficer.send(e) as OrganizationOfficer);
    model.byLawList = model.byLawList?.map(e => bylawInterceptor.send(e) as Bylaw);
    (model.lastUpdateDate && (model.lastUpdateDate = DateUtils.getDateStringFromDate(model.lastUpdateDate)));

    (model.firstReleaseDate && (model.firstReleaseDate = DateUtils.getDateStringFromDate(model.firstReleaseDate)));

    return model;
  }
  receive(model: CharityOrganizationUpdate): CharityOrganizationUpdate {
    model.registrationAuthorityInfo = AdminResult.createInstance(model.registrationAuthorityInfo);

    model.workAreaObjectList = model.workAreaObjectList?.map(e => workAreaInterceptor.receive(e) as WorkArea);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    (model.assignDate && (model.assignDate = DateUtils.getDateStringFromDate(model.assignDate)));
    (model.publishDate && (model.publishDate = DateUtils.getDateStringFromDate(model.publishDate)));
    (model.lastUpdateDate && (model.lastUpdateDate = DateUtils.getDateStringFromDate(model.lastUpdateDate)));
    (model.firstReleaseDate && (model.firstReleaseDate = DateUtils.getDateStringFromDate(model.firstReleaseDate)));
    (model.registrationDate && (model.registrationDate = DateUtils.getDateStringFromDate(model.registrationDate)));
    (model.establishmentDate && (model.establishmentDate = DateUtils.getDateStringFromDate(model.establishmentDate)));
    model.charityBranchList = model.charityBranchList?.map(e => new CharityBranch().clone(charityBranchInterceptor.receive(e)));
    model.wFClassificationList = model.wFClassificationList?.map(e => foreignAidClassificationInterceptor.receive(e));
    model.realBeneficiaryList = model.realBeneficiaryList?.map(e => realBeneficiaryInterceptor.receive(new RealBeneficiary().clone(e)) as RealBeneficiary);
    model.boardMemberList = model.boardMemberList?.map(e => membersInterceptor.receive(e) as OrgMember);
    model.authorizedSignatoryMemberList = model.authorizedSignatoryMemberList?.map(e => membersInterceptor.receive(e) as OrgMember);
    model.founderMemberList = model.founderMemberList?.map(e => membersInterceptor.receive(e) as OrgMember);
    model.generalAssemblyMemberList = model.generalAssemblyMemberList?.map(e => membersInterceptor.receive(e) as OrgMember);
    model.currentExecutiveManagementList = model.currentExecutiveManagementList?.map(e => membersInterceptor.receive(e) as OrgMember);
    model.byLawList = model.byLawList?.map(e => bylawInterceptor.receive(e));
    model.riskReportList = model.riskReportList?.map(e => charityReportInterceptor.receive(e) as CharityReport);
    model.coordinationSupportReport = model.coordinationSupportReport?.map(e => charityReportInterceptor.receive(e) as CharityReport);
    model.incomingReportList = model.incomingReportList?.map(e => charityReportInterceptor.receive(e) as CharityReport);
    model.incomingDecisionList = model.incomingDecisionList?.map(e => charityDecisionInterceptor.receive(e) as CharityDecision);
    model.outgoingDecisionList = model.outgoingDecisionList?.map(e => charityDecisionInterceptor.receive(e) as CharityDecision);
    model.complianceOfficerList = model.complianceOfficerList?.map(e => organizationOfficer.receive(e) as OrganizationOfficer);
    model.charityContactOfficerList = model.charityContactOfficerList?.map(e => organizationOfficer.receive(e) as OrganizationOfficer);
    model.publishDateStamp = !model.publishDate ? null : DateUtils.getTimeStampFromDate(model.publishDate);
    model.registrationDateStamp = !model.registrationDate ? null : DateUtils.getTimeStampFromDate(model.registrationDate);
    model.establishmentDateStamp = !model.establishmentDate ? null : DateUtils.getTimeStampFromDate(model.establishmentDate);
    model.firstReleaseDateStamp = !model.firstReleaseDate ? null : DateUtils.getTimeStampFromDate(model.firstReleaseDate);
    model.lastUpdateDateStamp = !model.lastUpdateDate ? null : DateUtils.getTimeStampFromDate(model.lastUpdateDate);

    return model;
  }
}
