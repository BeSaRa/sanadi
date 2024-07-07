import { BaseModel } from '@app/models/base-model';
import { TrainingProgramService } from '@app/services/training-program.service';
import { FactoryService } from '@app/services/factory.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { AdminResult } from '@app/models/admin-result';
import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { ISearchFieldsMap } from '@app/types/types';
import { TraineeData } from '@app/models/trainee-data';
import { TrainingProgramBriefcase } from '@app/models/training-program-briefcase';
import { TrainingStatus } from "@app/enums/training-status";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { Observable } from "rxjs";
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { InterceptModel } from "@decorators/intercept-model";
import { TrainingProgramInterceptor } from "@app/model-interceptors/training-program-interceptor";

const { receive, send } = new TrainingProgramInterceptor()

@InterceptModel({
  receive,
  send
})
export class TrainingProgram extends BaseModel<TrainingProgram, TrainingProgramService> {
  service: TrainingProgramService;
  activityName!: string;
  trainingProgramSerial!: string;
  trainingProgramFullSerial!: string;
  trainingType!: number;
  trainingTypeInfo!: AdminResult;
  optionalTargetOrganizationList!: string;
  optionalTargetOrganizationListIds: number[] = [];
  classificationId!: number;
  statusInfo!: AdminResult;
  trainingDate!: string;
  registrationDate!: string;
  trainingObjective!: string;
  trainingDomain!: number;
  trainingPartner!: number;
  trainingTopics!: string;
  targetOrganizationList!: string;
  targetOrganizationListIds: number[] = [];
  targetAudienceList!: string;
  targetAudienceListIds: number[] = [];
  durationInDays!: number;
  durationInHours!: number;
  averageDurationInHours!: number;
  startDate!: IMyDateModel | string;
  startDateString!: string;
  endDate!: IMyDateModel | string;
  endDateString!: string;
  sessionStartTime!: number;
  sessionEndTime!: number;
  sessionEndTimeMinutes!: number;
  sessionStartTimeMinutes!: number;
  trainingLocation!: string;
  trainerList!: string;
  trainerListIds: number[] = [];
  contactPerson!: string;
  attendenceMethod!: number;
  trainingLang!: string;
  numberOfSeats!: number;
  comments!: string;
  status!: number;
  registerationStartDate!: IMyDateModel | string;
  registerationStartDateString!: string;
  registerationClosureDate!: IMyDateModel | string;
  registerationClosureDateString!: | string;
  totalTrainingCost!: number;
  traineeList: TraineeData[] = [];
  trainingBundleList: TrainingProgramBriefcase[] = [];
  isOpenForCertification!: boolean;
  trainingSurveyTemplateId!: number;
  surveyPublished!: boolean;
  attendencePublished!: boolean;

  // to be removed
  registeredTraineeNumber: number = 0;
  acceptedTraineeNumber: number = 0;
  trainingLangParsed: number[] = [];

  // unused properties
  trainerInfoList: any;

  searchFields: ISearchFieldsMap<TrainingProgram> = {
    ...normalSearchFields(['activityName', 'startDateString', 'endDateString', 'registerationStartDateString', 'registerationClosureDateString']),
    ...infoSearchFields(['trainingTypeInfo', 'statusInfo'])
  };

  constructor() {
    super();
    this.service = FactoryService.getService('TrainingProgramService');
  }

  buildForm(controls?: boolean): any {
    const {
      activityName,
      trainingType,
      trainingObjective,
      trainingTopics,
      targetAudienceListIds,
      durationInDays,
      durationInHours,
      trainingDomain,
      trainingPartner,
      averageDurationInHours,
      startDate,
      endDate,
      sessionStartTime,
      sessionEndTime,
      sessionEndTimeMinutes,
      sessionStartTimeMinutes,
      trainingLocation,
      contactPerson,
      attendenceMethod,
      trainingLangParsed,
      numberOfSeats,
      comments,
      registerationStartDate,
      registerationClosureDate,
      totalTrainingCost,
      classificationId
    } = this;
    return {
      activityName: controls ? [activityName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)
      ]] : activityName,
      trainingType: controls ? [trainingType, [
        CustomValidators.required
      ]] : trainingType,
      classificationId: controls ? [classificationId, [
        CustomValidators.required
      ]] : classificationId,
      trainingObjective: controls ? [trainingObjective, [
        CustomValidators.required,
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)
      ]] : trainingObjective,
      trainingTopics: controls ? [trainingTopics, [
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)
      ]] : trainingTopics,
      trainingDomain: controls ? [trainingDomain, [
        CustomValidators.required
      ]] : trainingDomain,
      trainingPartner: controls ? [trainingPartner, [
        CustomValidators.required
      ]] : trainingPartner,
      targetAudienceListIds: controls ? [targetAudienceListIds, [
        CustomValidators.requiredArray
      ]] : targetAudienceListIds,
      durationInDays: controls ? [durationInDays, [
        CustomValidators.required,
        CustomValidators.pattern('NUM_HYPHEN_COMMA')
      ]] : durationInDays,
      durationInHours: controls ? [durationInHours, [
        CustomValidators.required,
        CustomValidators.pattern('NUM_HYPHEN_COMMA')
      ]] : durationInHours,
      averageDurationInHours: controls ? [averageDurationInHours, [
        CustomValidators.required,
        CustomValidators.pattern('ENG_NUM_ONLY')
      ]] : averageDurationInHours,
      startDate: controls ? [startDate, [
        CustomValidators.required
      ]] : startDate,
      endDate: controls ? [endDate, [
        CustomValidators.required
      ]] : endDate,
      sessionStartTime: controls ? [sessionStartTime, [
        CustomValidators.required
      ]] : sessionStartTime,
      sessionEndTime: controls ? [sessionEndTime, [
        CustomValidators.required
      ]] : sessionEndTime,
      sessionEndTimeMinutes: controls ? [sessionEndTimeMinutes, [
        CustomValidators.required
      ]] : sessionEndTimeMinutes,
      sessionStartTimeMinutes: controls ? [sessionStartTimeMinutes, [
        CustomValidators.required
      ]] : sessionStartTimeMinutes,
      trainingLocation: controls ? [trainingLocation, [
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)
      ]] : trainingLocation,
      contactPerson: controls ? [contactPerson, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)
      ]] : contactPerson,
      attendenceMethod: controls ? [attendenceMethod, [
        CustomValidators.required
      ]] : attendenceMethod,
      trainingLangParsed: controls ? [trainingLangParsed, [
        CustomValidators.requiredArray
      ]] : trainingLangParsed,
      numberOfSeats: controls ? [numberOfSeats, [
        CustomValidators.pattern('ENG_NUM_ONLY')
      ]] : numberOfSeats,
      comments: controls ? [comments, [
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)
      ]] : comments,
      registerationStartDate: controls ? [registerationStartDate, [
        CustomValidators.required
      ]] : registerationStartDate,
      registerationClosureDate: controls ? [registerationClosureDate, [
        CustomValidators.required
      ]] : registerationClosureDate,
      totalTrainingCost: controls ? [totalTrainingCost, [
        CustomValidators.required,
        CustomValidators.decimal(2)
      ]] : totalTrainingCost
    }
  }

  approve() {
    return this.service.approve(this.id);
  }

  publish() {
    return this.service.publish(this.id);
  }

  cancel() {
    return this.service.cancel(this.id);
  }

  isFinishedProgram(): boolean {
    return this.status === TrainingStatus.TRAINING_FINISHED;
  }

  readyForSurvey(): boolean {
    return this.isFinishedProgram() && this.attendencePublished;
  }

  publishSurvey(): DialogRef {
    return this.service.publishSurvey(this);
  }

  viewProgramSurvey(): Observable<DialogRef> {
    return this.service.viewProgramSurvey(this);
  }

  editAfterPublish(model: TrainingProgram) {
    return this.service.editAfterPublish(model);
  }

  editAfterPublishAndSenMail(model: TrainingProgram) {
    return this.service.editAfterPublishAndSenMail(model);
  }

}
