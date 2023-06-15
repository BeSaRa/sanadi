import {mixinRequestType} from '@app/mixins/mixin-request-type';
import {CaseModel} from '@app/models/case-model';
import {
  GeneralAssociationMeetingAttendanceInterceptor
} from '@app/model-interceptors/general-association-meeting-attendance-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {GeneralAssociationMeetingAttendanceService} from '@services/general-association-meeting-attendance.service';
import {HasRequestType} from '@contracts/has-request-type';
import {FactoryService} from '@services/factory.service';
import {IMyDateModel} from 'angular-mydatepicker';
import {AdminResult} from '@app/models/admin-result';
import {GeneralAssociationInternalMember} from '@app/models/general-association-internal-member';
import {GeneralAssociationExternalMember} from '@app/models/general-association-external-member';
import {CustomValidators} from '@app/validators/custom-validators';
import {CaseTypes} from '@app/enums/case-types.enum';
import {UntypedFormGroup} from '@angular/forms';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {GeneralAssociationMeetingStepNameEnum} from '@app/enums/general-association-meeting-step-name-enum';
import {
  IGeneralAssociationMeetingAttendanceSpecialActions
} from '@contracts/i-general-association-meeting-attendance-special-actions';
import {
  IGeneralAssociationMeetingAttendanceComplete
} from '@contracts/i-general-association-meeting-attendance-complete';
import {Observable} from 'rxjs';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {dateSearchFields} from '@helpers/date-search-fields';
import {infoSearchFields} from '@helpers/info-search-fields';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {
  IGeneralAssociationMeetingAttendanceFinalApprove
} from '@contracts/i-general-association-meeting-attendance-final-approve';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';
import {ObjectUtils} from '@app/helpers/object-utils';
import {GeneralAssociationAgenda} from './general-association-meeting-agenda';
import {DateUtils} from '@app/helpers/date-utils';

const _RequestType = mixinRequestType(CaseModel);
const interceptor = new GeneralAssociationMeetingAttendanceInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})

export class GeneralAssociationMeetingAttendance extends _RequestType<GeneralAssociationMeetingAttendanceService, GeneralAssociationMeetingAttendance> implements HasRequestType, IGeneralAssociationMeetingAttendanceSpecialActions, IGeneralAssociationMeetingAttendanceComplete, IGeneralAssociationMeetingAttendanceFinalApprove, IAuditModelProperties<GeneralAssociationMeetingAttendance> {
  service!: GeneralAssociationMeetingAttendanceService;
  caseType = CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE;
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
  oldLicenseFullSerial!: string;
  periodical!: number;
  specialistDecision!: number;
  specialistJustification!: string;
  subject!: string;
  year!: number;
  isSendToMember!: boolean;
  organizationId!: number;
  npoApproved!: boolean;
  generalAssociationMembers: GeneralAssociationExternalMember[] = [];
  administrativeBoardMembers: GeneralAssociationExternalMember[] = [];
  internalMembersDTO: GeneralAssociationInternalMember[] = [];
  specialistDecisionInfo!: AdminResult;
  meetingTypeInfo!: AdminResult;
  meetingClassificationInfo!: AdminResult;
  managerDecisionInfo!: AdminResult;
  agendaList: GeneralAssociationAgenda[] = [];
  isFinal!: boolean;
  meetingDateTimestamp!: number | null;


  searchFields: ISearchFieldsMap<GeneralAssociationMeetingAttendance> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['caseStatusInfo', 'requestTypeInfo', 'ouInfo', 'creatorInfo']),
    ...normalSearchFields(['fullSerial', 'subject'])
  };

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  constructor() {
    super();
    this.service = FactoryService.getService('GeneralAssociationMeetingAttendanceService');
  }

  getAdminResultByProperty(property: keyof GeneralAssociationMeetingAttendance): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;
      case 'meetingType':
        adminResultValue = this.meetingTypeInfo;
        break;
      case 'meetingClassification':
        adminResultValue = this.meetingClassificationInfo;
        break;
      case 'meetingDate':
        const dateValue = DateUtils.getDateStringFromDate(this.meetingDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({arName: dateValue, enName: dateValue});
        break;
      case 'meetingTime':
        const timeValue = DateUtils.getHoursList().find(x => x.val === this.meetingTime)!.key;
        adminResultValue = AdminResult.createInstance({arName: timeValue, enName: timeValue});
        break;
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }

  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: {langKey: 'request_type', value: this.requestType},
      oldLicenseFullSerial: {langKey: 'serial_number', value: this.oldLicenseFullSerial},
      meetingType: {langKey: 'general_association_meeting_type', value: this.meetingType},
      location: {langKey: 'location', value: this.location},
      meetingDate: {langKey: 'meeting_date', value: this.meetingDate, comparisonValue: this.meetingDateTimestamp},
      meetingTime: {langKey: 'meeting_time', value: this.meetingTime},
      meetingInitiator: {langKey: 'meeting_initiator', value: this.meetingInitiator},
      meetingClassification: {langKey: 'meeting_classification', value: this.meetingClassification},
      periodical: {langKey: 'meeting_periodical', value: this.periodical},
      year: {langKey: 'year', value: this.year}
    }
  }

  getExplanationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      description: {langKey: 'special_explanations', value: this.description},
    }
  }

  buildBasicInfo(controls: boolean = false): any {
    const {
      oldFullSerial,
      requestType,
      meetingType,
      location,
      meetingDate,
      meetingTime,
      meetingInitiator,
      meetingClassification,
      periodical,
      year
    } = ObjectUtils.getControlValues<GeneralAssociationMeetingAttendance>(this.getBasicInfoValuesWithLabels());
    ;
    ;
    return {
      oldFullSerial: controls ? [oldFullSerial] : oldFullSerial,
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      meetingType: controls ? [meetingType, [CustomValidators.required]] : meetingType,
      location: controls ? [location, [CustomValidators.required, CustomValidators.maxLength(300), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : location,
      meetingDate: controls ? [meetingDate, [CustomValidators.required]] : meetingDate,
      meetingTime: controls ? [meetingTime, []] : meetingTime,
      meetingInitiator: controls ? [meetingInitiator, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : meetingInitiator,
      meetingClassification: controls ? [meetingClassification, [CustomValidators.required]] : meetingClassification,
      periodical: controls ? [periodical, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(2)]] : periodical,
      year: controls ? [{
        value: year,
        disabled: true
      }, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(2)]] : year
    };
  }

  buildExplanation(controls: boolean = false): any {
    const {description} = ObjectUtils.getControlValues<GeneralAssociationMeetingAttendance>(this.getExplanationValuesWithLabels());
    return {
      description: controls ? [description, [CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]] : description,
    };
  }

  completeWithSave(form: UntypedFormGroup, selectedAdministrativeBoardMembers: GeneralAssociationExternalMember[], selectedGeneralAssociationMembers: GeneralAssociationExternalMember[], agendaItems: string[]): DialogRef {
    return this.service!.completeTask(this, WFResponseType.COMPLETE, form, selectedAdministrativeBoardMembers, selectedGeneralAssociationMembers, agendaItems);
  }

  approveWithSave(selectedInternalMembers: GeneralAssociationInternalMember[], meetingDate: IMyDateModel, year: number): DialogRef {
    return this.service!.approveTask(this, WFResponseType.APPROVE, selectedInternalMembers, meetingDate, year);
  }

  initialApproveWithSave(selectedInternalMembers: GeneralAssociationInternalMember[], meetingDate: IMyDateModel, year: number): DialogRef {
    return this.service!.approveTask(this, WFResponseType.INITIAL_APPROVE, selectedInternalMembers, meetingDate, year);
  }

  isSupervisionAndControlReviewStep(): boolean {
    return this.taskDetails?.name === GeneralAssociationMeetingStepNameEnum.SUPERVISION_AND_CONTROL_REVIEW;
  }

  isSupervisionManagerReviewStep(): boolean {
    return this.taskDetails?.name === GeneralAssociationMeetingStepNameEnum.SUPERVISION_MANAGER_REVIEW;
  }

  isSupervisionAndControlReworkStep(): boolean {
    return this.taskDetails?.name === GeneralAssociationMeetingStepNameEnum.SUPERVISION_AND_CONTROL_REWORK;
  }

  isSupervisionAndControlTeamReviewStep(): boolean {
    return this.taskDetails?.name === GeneralAssociationMeetingStepNameEnum.SupervisionAndControlTeamReview;
  }

  isSupervisionAndControlTeamReworkStep(): boolean {
    return this.taskDetails?.name === GeneralAssociationMeetingStepNameEnum.SupervisionAndControlTeamRework;
  }

  isDecisionMakerReviewStep(): boolean {
    return this.taskDetails?.name === GeneralAssociationMeetingStepNameEnum.DECISION_MAKER_REVIEW;
  }

  isDecisionMakerReworkStep(): boolean {
    return this.taskDetails?.name === GeneralAssociationMeetingStepNameEnum.DECISION_MAKER_REWORK;
  }

  isManagerFinalReviewStep(): boolean {
    return this.taskDetails?.name === GeneralAssociationMeetingStepNameEnum.MANAGER_FINAL_REVIEW;
  }

  isCharityManagerReviewStep(): boolean {
    return this.taskDetails?.name === GeneralAssociationMeetingStepNameEnum.CharityManagerReview;
  }

  isMemberReviewStep(): boolean {
    return this.taskDetails?.name === GeneralAssociationMeetingStepNameEnum.MEMBER_REVIEW;
  }

  isSupervisionAndControlStep(): boolean {
    return this.taskDetails?.name === GeneralAssociationMeetingStepNameEnum.SUPERVISION_AND_CONTROL_REWORK;
  }

  sendToGeneralMeetingMembers(): DialogRef {
    return this.inboxService!.takeActionWithComment(this.id, this.caseType, WFResponseType.TO_GENERAL_MEETING_MEMBERS, false, this);
  }

  memberCanNotComplete(): DialogRef {
    return this.inboxService!.completeCanNotBeCompleted();
  }

  canEditMeetingPoints(): boolean {
    return !this.isSendToMember && this.isDecisionMakerReviewStep() || this.isMemberReviewStep();
  }

  canEditSelfMadeMeetingPoints(isSelfMadePoint: boolean): boolean {
    return !this.isSendToMember && this.isDecisionMakerReviewStep() || (this.isSendToMember && this.isMemberReviewStep() && isSelfMadePoint);
  }

  canAddMeetingPoints(): boolean {
    return (!this.isSendToMember && this.isDecisionMakerReviewStep()) || (this.isSendToMember && this.isMemberReviewStep());
  }

  canRemoveMeetingPoints(isSelfMadePoint: boolean): boolean {
    return (!this.isSendToMember && this.isDecisionMakerReviewStep()) || (this.isSendToMember && this.isMemberReviewStep() && isSelfMadePoint);
  }

  isSentToMember(): boolean {
    return this.isSendToMember;
  }

  proceedSendToMembers(caseId: string): Observable<boolean> {
    return this.service.proceedSendToMembers(caseId);
  }

  downloadFinalReport(): void {
    this.service.downloadFinalReport(this.meetingReportID).subscribe(blob => {
      window.open(blob.url);
    });
  }
}
