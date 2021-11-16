import {BaseModel} from '@app/models/base-model';
import {TrainingProgramService} from '@app/services/training-program.service';
import {FactoryService} from '@app/services/factory.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {AdminResult} from '@app/models/admin-result';
import {IMyDateModel} from 'angular-mydatepicker';
import {searchFunctionType} from '@app/types/types';

export class TrainingProgram extends BaseModel<TrainingProgram, TrainingProgramService>{
  service: TrainingProgramService;
  activityName!: string;
  trainingProgramSerial!: string;
  trainingProgramFullSerial!: string;
  trainingType!: number;
  trainingTypeInfo!: AdminResult;
  trainingDate!: string;
  registrationDate!: string;
  trainingObjective!: string;
  trainingTopics!: string;
  targetOrganizationList!: string;
  targetOrganizationListIds: number[] = [];
  targetAudienceList!: string;
  targetAudienceListIds: number[] = [];
  durationInDays!: string;
  durationInHours!: string;
  averageDurationInHours!: string;
  startDate!: IMyDateModel | string;
  endDate!: IMyDateModel | string;
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
  registerationClosureDate!: IMyDateModel | string;
  totalTrainingCost!: number;

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
      targetOrganizationListIds,
      targetAudienceListIds,
      durationInDays,
      durationInHours,
      averageDurationInHours,
      startDate,
      endDate,
      sessionStartTime,
      sessionEndTime,
      trainingLocation,
      trainerListIds,
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
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)
      ]] : trainingObjective,
      trainingTopics: controls ? [trainingTopics, [
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)
      ]] : trainingTopics,
      targetAudienceListIds: controls ? [targetAudienceListIds, [
        CustomValidators.required
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
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)
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
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)
      ]] : comments,
      registerationStartDate: controls ? [registerationStartDate, [
        CustomValidators.required
      ]] : registerationStartDate,
      registerationClosureDate: controls ? [registerationClosureDate, [
        CustomValidators.required
      ]] : registerationClosureDate,
      totalTrainingCost: controls ? [totalTrainingCost, [
        CustomValidators.required,
        CustomValidators.pattern('ENG_NUM_ONLY')
      ]] : totalTrainingCost
    }
  }
}
