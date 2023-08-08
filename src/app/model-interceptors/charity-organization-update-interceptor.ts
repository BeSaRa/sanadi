import { DateUtils } from '@app/helpers/date-utils';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { Bylaw } from '@app/models/bylaw';
import { CharityBranch } from '@app/models/charity-branch';
import { CharityDecision } from '@app/models/charity-decision';
import { CharityOrganizationUpdate } from '@app/models/charity-organization-update';
import { CharityReport } from '@app/models/charity-report';
import { ForeignAidClassification } from '@app/models/foreign-aid-classification';
import { OrgExecutiveMember } from '@app/models/org-executive-member';
import { OrgMember } from '@app/models/org-member';
import { OrganizationOfficer } from '@app/models/organization-officer';
import { RealBeneficiary } from '@app/models/real-beneficiary';
import { WorkArea } from '@app/models/work-area';
import { ByLawInterceptor } from './bylaw-interceptor';
import { CharityBranchInterceptor } from './charity-branch-interceptor';
import { CharityDecisionInterceptor } from './charity-Decision-interceptor';
import { CharityReportInterceptor } from './charity-report-interceptor';
import { ForeignAidClassificationInterceptor } from './foreign-aid-classification-interceptor';
import { OrgExecutiveMemberInterceptor } from './org-executive-member-interceptor';
import { OrgMemberInterceptor } from './org-member-interceptor';
import { OrganizationOfficerInterceptor } from './organization-officer-interceptor';
import { RealBeneficiaryInterceptor } from './real-beneficiary-interceptors';
import { WorkAreaInterceptor } from './workarea-interceptor';

const bylawInterceptor = new ByLawInterceptor();
const charityReportInterceptor = new CharityReportInterceptor();
const charityDecisionInterceptor = new CharityDecisionInterceptor();
const realBeneficiaryInterceptor = new RealBeneficiaryInterceptor();
const membersInterceptor = new OrgMemberInterceptor();
const executiveMemberInterceptor = new OrgExecutiveMemberInterceptor();

const organizationOfficerInterceptor = new OrganizationOfficerInterceptor();
const foreignAidClassificationInterceptor = new ForeignAidClassificationInterceptor();
const charityBranchInterceptor = new CharityBranchInterceptor();
const workAreaInterceptor = new WorkAreaInterceptor();

export class CharityOrganizationUpdateInterceptor implements IModelInterceptor<CharityOrganizationUpdate> {
  caseInterceptor?: IModelInterceptor<CharityOrganizationUpdate> | undefined;
  send(model: Partial<CharityOrganizationUpdate>): Partial<CharityOrganizationUpdate> {
    model.registrationAuthority = model.registrationAuthorityInfo?.id;
    model.workAreaObjectList = model.workAreaObjectList?.map(e => workAreaInterceptor.send(e) as WorkArea);
    model.charityBranchList = model.charityBranchList?.map(e => {
      e.itemId = !e.itemId ? e.id?.toString() : e.itemId;
      return charityBranchInterceptor.send(e) as CharityBranch
    });
    model.realBeneficiaryList = model.realBeneficiaryList?.map(e => {
      e.itemId = !e.itemId ? e.id?.toString() : e.itemId;
      return realBeneficiaryInterceptor.send(e) as RealBeneficiary
    });
    model.boardMemberList = model.boardMemberList?.map(e => {
      e.itemId = !e.itemId ? e.id?.toString() : e.itemId;
      return membersInterceptor.send(e) as OrgMember
    });
    model.authorizedSignatoryMemberList = model.authorizedSignatoryMemberList?.map(e => {
      e.itemId = !e.itemId ? e.id?.toString() : e.itemId;
      return membersInterceptor.send(e) as OrgMember
    });
    model.founderMemberList = model.founderMemberList?.map(e => {
      e.itemId = !e.itemId ? e.id?.toString() : e.itemId;
      return membersInterceptor.send(e) as OrgMember
    });
    model.generalAssemblyMemberList = model.generalAssemblyMemberList?.map(e => {
      e.itemId = !e.itemId ? e.id?.toString() : e.itemId;
      return membersInterceptor.send(e) as OrgMember
    });
    model.currentExecutiveManagementList = model.currentExecutiveManagementList?.map(e => {
      e.itemId = !e.itemId ? e.id?.toString() : e.itemId;
      return executiveMemberInterceptor.send(e) as OrgExecutiveMember
    });
    model.riskReportList = model.riskReportList?.map(e => {
      e.itemId = !e.itemId ? e.id?.toString() : e.itemId;
      return charityReportInterceptor.send(e) as CharityReport
    });
    model.coordinationSupportReport = model.coordinationSupportReport?.map(e => {
      e.itemId = !e.itemId ? e.id?.toString() : e.itemId;
      return charityReportInterceptor.send(e) as CharityReport
    });
    model.incomingReportList = model.incomingReportList?.map(e => {
      e.itemId = !e.itemId ? e.id?.toString() : e.itemId;
      return charityReportInterceptor.send(e) as CharityReport
    });
    model.incomingDecisionList = model.incomingDecisionList?.map(e => {
      e.itemId = !e.itemId ? e.id?.toString() : e.itemId;
      return charityDecisionInterceptor.send(e) as CharityDecision
    });
    model.outgoingDecisionList = model.outgoingDecisionList?.map(e => {
      e.itemId = !e.itemId ? e.id?.toString() : e.itemId;
      return charityDecisionInterceptor.send(e) as CharityDecision
    });
    model.complianceOfficerList = model.complianceOfficerList?.map(e => {
      e.itemId = !e.itemId ? e.id?.toString() : e.itemId;
      return organizationOfficerInterceptor.send(e) as OrganizationOfficer
    });
    model.wFClassificationList = model.wFClassificationList?.map(e => {
      e.itemId = !e.itemId ? e.id?.toString() : e.itemId;
      return foreignAidClassificationInterceptor.send(e) as ForeignAidClassification
    });
    model.charityContactOfficerList = model.charityContactOfficerList?.map(e => {
      e.itemId = !e.itemId ? e.id?.toString() : e.itemId;
      return organizationOfficerInterceptor.send(e) as OrganizationOfficer
    });
    model.byLawList = model.byLawList?.map(e => bylawInterceptor.send(e) as Bylaw);
    (model.lastUpdateDate && (model.lastUpdateDate = DateUtils.getDateStringFromDate(model.lastUpdateDate)));
    (model.firstReleaseDate && (model.firstReleaseDate = DateUtils.getDateStringFromDate(model.firstReleaseDate)));

    CharityOrganizationUpdateInterceptor._deleteBeforeSend(model);
    return model;
  }
  receive(model: CharityOrganizationUpdate): CharityOrganizationUpdate {
    model.registrationAuthorityInfo = AdminResult.createInstance(model.registrationAuthorityInfo);

    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.activityTypeInfo = AdminResult.createInstance(model.activityTypeInfo);
    model.registrationAuthorityInfo = AdminResult.createInstance(model.registrationAuthorityInfo);
    model.charityWorkAreaInfo = AdminResult.createInstance(model.charityWorkAreaInfo);
    (model.assignDate && (model.assignDate = DateUtils.getDateStringFromDate(model.assignDate)));
    (model.publishDate && (model.publishDate = DateUtils.getDateStringFromDate(model.publishDate)));
    (model.lastUpdateDate && (model.lastUpdateDate = DateUtils.getDateStringFromDate(model.lastUpdateDate)));
    (model.firstReleaseDate && (model.firstReleaseDate = DateUtils.getDateStringFromDate(model.firstReleaseDate)));
    (model.registrationDate && (model.registrationDate = DateUtils.getDateStringFromDate(model.registrationDate)));
    (model.establishmentDate && (model.establishmentDate = DateUtils.getDateStringFromDate(model.establishmentDate)));
    model.workAreaObjectList = model.workAreaObjectList?.map(e => workAreaInterceptor.receive(new WorkArea().clone(e)));
    model.charityBranchList = model.charityBranchList?.map(e => new CharityBranch().clone(charityBranchInterceptor.receive(new CharityBranch().clone(e))));
    model.wFClassificationList = model.wFClassificationList?.map(e => foreignAidClassificationInterceptor.receive(new ForeignAidClassification().clone(e)));
    model.realBeneficiaryList = model.realBeneficiaryList?.map(e => realBeneficiaryInterceptor.receive(new RealBeneficiary().clone(new RealBeneficiary().clone(e))));
    model.boardMemberList = model.boardMemberList?.map(e => membersInterceptor.receive(new OrgMember().clone(e)));
    model.authorizedSignatoryMemberList = model.authorizedSignatoryMemberList?.map(e => membersInterceptor.receive(new OrgMember().clone(e)));
    model.founderMemberList = model.founderMemberList?.map(e => membersInterceptor.receive(new OrgMember().clone(e)));
    model.generalAssemblyMemberList = model.generalAssemblyMemberList?.map(e => membersInterceptor.receive(new OrgMember().clone(e)));
    model.currentExecutiveManagementList = model.currentExecutiveManagementList?.map(e => executiveMemberInterceptor.receive(new OrgExecutiveMember().clone(e)));
    model.byLawList = model.byLawList?.map(e => bylawInterceptor.receive(new Bylaw().clone(e)));
    model.riskReportList = model.riskReportList?.map(e => charityReportInterceptor.receive(new CharityReport().clone(e)));
    model.coordinationSupportReport = model.coordinationSupportReport?.map(e => charityReportInterceptor.receive(new CharityReport().clone(e)));
    model.incomingReportList = model.incomingReportList?.map(e => charityReportInterceptor.receive(new CharityReport().clone(e)));
    model.incomingDecisionList = model.incomingDecisionList?.map(e => charityDecisionInterceptor.receive(new CharityDecision().clone(e)));
    model.outgoingDecisionList = model.outgoingDecisionList?.map(e => charityDecisionInterceptor.receive(new CharityDecision().clone(e)));
    model.complianceOfficerList = model.complianceOfficerList?.map(e => organizationOfficerInterceptor.receive(new OrganizationOfficer().clone(e)));
    model.charityContactOfficerList = model.charityContactOfficerList?.map(e => organizationOfficerInterceptor.receive(new OrganizationOfficer().clone(e)));
    model.publishDateStamp = !model.publishDate ? null : DateUtils.getTimeStampFromDate(model.publishDate);
    model.registrationDateStamp = !model.registrationDate ? null : DateUtils.getTimeStampFromDate(model.registrationDate);
    model.establishmentDateStamp = !model.establishmentDate ? null : DateUtils.getTimeStampFromDate(model.establishmentDate);
    model.firstReleaseDateStamp = !model.firstReleaseDate ? null : DateUtils.getTimeStampFromDate(model.firstReleaseDate);
    model.lastUpdateDateStamp = !model.lastUpdateDate ? null : DateUtils.getTimeStampFromDate(model.lastUpdateDate);

    return model;
  }
  private static _deleteBeforeSend(model: Partial<CharityOrganizationUpdate> | any): void {
    delete model.searchFields;
    delete model.requestTypeInfo;
    delete model.ouInfo;
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
    delete model.updateSectionInfo;
    delete model.inboxService;
    delete model.encrypt;
    delete model.employeeService;
    delete model.creatorInfo;
    delete model.charityWorkAreaInfo;
    delete model.caseStatusInfo;
    delete model.taskDetails;

  }
}
