import {BaseModel} from '@app/models/base-model';
import {TrainingProgramService} from '@app/services/training-program.service';
import {FactoryService} from '@app/services/factory.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {AdminResult} from '@app/models/admin-result';
import {IMyDateModel} from 'angular-mydatepicker';
import {searchFunctionType} from '@app/types/types';
import {TraineeData} from '@app/models/trainee-data';
import {TrainingProgramBriefcase} from '@app/models/training-program-briefcase';
import {TrainingStatus} from "@app/enums/training-status";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {Observable} from "rxjs";

export class TrainingProgram extends BaseModel<TrainingProgram, TrainingProgramService>{
  service: TrainingProgramService;
  activityName!: string;
  trainingProgramSerial!: string;
  trainingProgramFullSerial!: string;
  trainingType!: number;
  trainingTypeInfo!: AdminResult;
  statusInfo!: AdminResult;
  trainingDate!: string;
  registrationDate!: string;
  trainingObjective!: string;
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
  trainingLocation!: string;
  trainerList!: string;
  trainerListIds: number[] = [];
  contactPerson!: string;
  attendenceMethod!: number;
  trainingLang!: number;
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

  // to be removed
  registeredTraineeNumber: number = 0;
  acceptedTraineeNumber: number = 0;

  // unused properties
  trainerInfoList: any;

  searchFields: { [key: string]: searchFunctionType | string } = {
    activityName: 'activityName'
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
      averageDurationInHours,
      startDate,
      endDate,
      sessionStartTime,
      sessionEndTime,
      trainingLocation,
      contactPerson,
      attendenceMethod,
      trainingLang,
      numberOfSeats,
      comments,
      registerationStartDate,
      registerationClosureDate,
      totalTrainingCost,
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
      trainingObjective: controls ? [trainingObjective, [
        CustomValidators.required,
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)
      ]] : trainingObjective,
      trainingTopics: controls ? [trainingTopics, [
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)
      ]] : trainingTopics,
      targetAudienceListIds: controls ? [targetAudienceListIds, [
        CustomValidators.requiredArray
      ]] : targetAudienceListIds,
      durationInDays: controls ? [durationInDays, [
        CustomValidators.required,
        CustomValidators.pattern('ENG_NUM_ONLY')
      ]] : durationInDays,
      durationInHours: controls ? [durationInHours, [
        CustomValidators.required,
        CustomValidators.pattern('ENG_NUM_ONLY')
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
      trainingLang: controls ? [trainingLang, [
        CustomValidators.required
      ]] : trainingLang,
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
