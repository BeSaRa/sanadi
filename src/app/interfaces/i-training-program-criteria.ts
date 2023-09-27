import {IMyDateModel} from 'angular-mydatepicker';

export interface ITrainingProgramCriteria {
  activityName?: string;
  trainingProgramFullSerial?: string;
  trainingType?: number;
  targetAudience?: number;
  optionalTargetOrganizationList?: string;
  optionalTargetOrganizationListIds?: number[];
  classificationId?: number;
  targetOrganizationList?: string;
  targetOrganizationListIds?: number[];
  startFromDate?: string | IMyDateModel;
  startToDate?: string | IMyDateModel;
  attendenceMethod?: number;
  status?: number;
  registerationFromDate?: string | IMyDateModel | number;
  registerationToDate?: string | IMyDateModel;
  trainer?: number;
}
