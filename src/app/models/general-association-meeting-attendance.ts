import {mixinRequestType} from '@app/mixins/mixin-request-type';
import {CaseModel} from '@app/models/case-model';
import {GeneralAssociationMeetingAttendanceInterceptor} from '@app/model-interceptors/general-association-meeting-attendance-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {GeneralAssociationMeetingAttendanceService} from '@services/general-association-meeting-attendance.service';
import {HasRequestType} from '@contracts/has-request-type';
import {FactoryService} from '@services/factory.service';
import {IMyDateModel} from 'angular-mydatepicker';
import {AdminResult} from '@app/models/admin-result';
import {GeneralAssociationInternalMember} from '@app/models/general-association-internal-member';
import {GeneralAssociationExternalMember} from '@app/models/general-association-external-member';

const _RequestType = mixinRequestType(CaseModel);
const interceptor = new GeneralAssociationMeetingAttendanceInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})

export class GeneralAssociationMeetingAttendance extends _RequestType<GeneralAssociationMeetingAttendanceService, GeneralAssociationMeetingAttendance> implements HasRequestType {
  service!: GeneralAssociationMeetingAttendanceService;
  licenseApprovedDate!: string | IMyDateModel;
  agenda!: string;
  description!: string;
  followUpDate!: string | IMyDateModel;
  meetingType!: number;
  meetingClassification!: number;
  location!: string;
  meetingDate!: string | IMyDateModel;
  meetingTime!: number;
  meetingInitiator!: string;
  managerDecision!: number;
  managerJustification!: string;
  meetingReportID!: string;
  oldFullSerial!: string;
  periodical!: number;
  specialistDecision!: number;
  specialistJustification!: string;
  subject!: string;
  year!: number;
  generalAssociationMembers: GeneralAssociationExternalMember[] = [];
  administrativeBoardMembers: GeneralAssociationExternalMember[] = [];
  internalMembersDTO: GeneralAssociationInternalMember[] = [];
  specialistDecisionInfo!: AdminResult;
  meetingTypeInfo!: AdminResult;
  meetingClassificationInfo!: AdminResult;
  managerDecisionInfo!: AdminResult;

  constructor() {
    super();
    this.service = FactoryService.getService('GeneralAssociationMeetingAttendanceService');
  }
}
