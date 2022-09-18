import { DateUtils } from '@app/helpers/date-utils';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { CharityDecision } from '@app/models/charity-decision';
import { CharityOrganizationUpdate } from '@app/models/charity-organization-update';
import { CharityReport } from '@app/models/charity-report';
import { CharityDecisionInterceptor } from './charity-Decision-interceptor';
import { CharityReportInterceptor } from './charity-report-interceptor';

export class CharityOrganizationUpdateInterceptor implements IModelInterceptor<CharityOrganizationUpdate> {
  caseInterceptor?: IModelInterceptor<CharityOrganizationUpdate> | undefined;
  send(model: Partial<CharityOrganizationUpdate>): Partial<CharityOrganizationUpdate> {
    const charityReportInterceptor = new CharityReportInterceptor();
    const charityDecisionInterceptor = new CharityDecisionInterceptor();
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
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    return model;
  }
}
