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
import {CaseTypes} from '@app/enums/case-types.enum';
import {UntypedFormGroup} from '@angular/forms';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {GeneralAssociationMeetingStepNameEnum} from '@app/enums/general-association-meeting-step-name-enum';
import {IGeneralAssociationMeetingAttendanceSpecialActions} from '@contracts/i-general-association-meeting-attendance-special-actions';
import {IGeneralAssociationMeetingAttendanceComplete} from '@contracts/i-general-association-meeting-attendance-complete';
import {Observable} from 'rxjs';
import {ISearchFieldsMap} from '@app/types/types';
import {dateSearchFields} from '@helpers/date-search-fields';
import {infoSearchFields} from '@helpers/info-search-fields';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {IGeneralAssociationMeetingAttendanceFinalApprove} from '@contracts/i-general-association-meeting-attendance-final-approve';

const _RequestType = mixinRequestType(CaseModel);
const interceptor = new GeneralAssociationMeetingAttendanceInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})

export class GeneralAssociationMeetingAttendance extends _RequestType<GeneralAssociationMeetingAttendanceService, GeneralAssociationMeetingAttendance> implements HasRequestType, IGeneralAssociationMeetingAttendanceSpecialActions, IGeneralAssociationMeetingAttendanceComplete, IGeneralAssociationMeetingAttendanceFinalApprove {
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
  isFinal!: boolean;

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
    } = this;
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
    const {description} = this;
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

  isDecisionMakerReviewStep(): boolean {
    return this.taskDetails?.name === GeneralAssociationMeetingStepNameEnum.DECISION_MAKER_REVIEW;
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
