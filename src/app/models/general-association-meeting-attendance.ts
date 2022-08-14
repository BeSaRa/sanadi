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
import {CustomValidators} from '@app/validators/custom-validators';

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

  buildBasicInfo(controls: boolean = false): any {
    const {oldFullSerial, requestType, meetingType, location, meetingDate, meetingTime, meetingInitiator, meetingClassification, periodical} = this;
    return {
      oldFullSerial: controls ? [oldFullSerial] : oldFullSerial,
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      meetingType: controls ? [meetingType, [CustomValidators.required]] : meetingType,
      location: controls ? [location, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : location,
      meetingDate: controls ? [meetingDate, [CustomValidators.required]] : meetingDate,
      meetingTime: controls ? [meetingTime, []] : meetingTime,
      meetingInitiator: controls ? [meetingInitiator, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : meetingInitiator,
      meetingClassification: controls ? [meetingClassification, [CustomValidators.required]] : meetingClassification,
      periodical: controls ? [periodical, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(2)]] : periodical
    };
  }

  buildExplanation(controls: boolean = false): any {
    const {description} = this;
    return {
      description: controls ? [description, [CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]] : description,
    };
  }
}
