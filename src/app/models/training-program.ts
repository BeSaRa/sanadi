import {BaseModel} from '@app/models/base-model';
import {TrainingProgramService} from '@app/services/training-program.service';
import {FactoryService} from '@app/services/factory.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {AdminResult} from '@app/models/admin-result';

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
  startDate!: string;
  endDate!: string;
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
  registerationStartDate!: string;
  registerationClosureDate!: string;
  registeredTraineeNumber!: number;
  acceptedTraineeNumber!: number;
  totalTrainingCost!: number;

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
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM')
      ]] : activityName,
      trainingType: controls ? [trainingType, [
        CustomValidators.required
      ]] : trainingType,
      trainingObjective: controls ? [trainingObjective, [
        CustomValidators.required,
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM')
      ]] : trainingObjective,
      trainingTopics: controls ? [trainingTopics, [
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM')
      ]] : trainingTopics,
      targetOrganizationListIds: controls ? [targetOrganizationListIds, [
        CustomValidators.required
      ]] : targetOrganizationListIds,
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
        CustomValidators.required,
        CustomValidators.minDate(new Date()),
        CustomValidators.maxDate(this.endDate)
      ]] : startDate,
      endDate: controls ? [endDate, [
        CustomValidators.required,
        CustomValidators.minDate(this.startDate)
      ]] : endDate,
      sessionStartTime: controls ? [sessionStartTime, [
        CustomValidators.required
      ]] : sessionStartTime,
      sessionEndTime: controls ? [sessionEndTime, [
        CustomValidators.required
      ]] : sessionEndTime,
      trainingLocation: controls ? [trainingLocation, [
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM')
      ]] : trainingLocation,
      trainerListIds: controls ? [trainerListIds, [
        CustomValidators.required
      ]] : trainerListIds,
      contactPerson: controls ? [contactPerson, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM')
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
        CustomValidators.pattern('AR_NUM')
      ]] : comments,
      registerationStartDate: controls ? [registerationStartDate, [
        CustomValidators.required,
        CustomValidators.minDate(new Date()),
        CustomValidators.maxDate(this.registerationClosureDate)
      ]] : registerationStartDate,
      registerationClosureDate: controls ? [registerationClosureDate, [
        CustomValidators.required,
        CustomValidators.minDate(this.registerationStartDate)
      ]] : registerationClosureDate,
      totalTrainingCost: controls ? [totalTrainingCost, [
        CustomValidators.required,
        CustomValidators.pattern('ENG_NUM_ONLY')
      ]] : totalTrainingCost
    }
  }
}
