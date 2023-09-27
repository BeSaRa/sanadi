import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {TrainingProgram} from '@app/models/training-program';
import {AdminResult} from '@app/models/admin-result';
import {DateUtils} from '@app/helpers/date-utils';
import {Trainee} from '@app/models/trainee';
import {LookupService} from '@app/services/lookup.service';
import {FactoryService} from '@app/services/factory.service';
import {TrainingProgramBriefcaseService} from '@app/services/training-program-briefcase.service';
import {TrainingProgramBriefcase} from '@app/models/training-program-briefcase';
import {Lookup} from '@app/models/lookup';
import {CommonUtils} from '@helpers/common-utils';

export class TrainingProgramInterceptor implements IModelInterceptor<TrainingProgram> {
  receive(model: TrainingProgram): TrainingProgram {
    const lookupService = FactoryService.getService('LookupService') as LookupService;

    model.startDateString = DateUtils.getDateStringFromDate(model.startDate);
    model.endDateString = DateUtils.getDateStringFromDate(model.endDate);
    model.registerationStartDateString = DateUtils.getDateStringFromDate(model.registerationStartDate);
    model.registerationClosureDateString = DateUtils.getDateStringFromDate(model.registerationClosureDate);
    model.trainingTypeInfo = AdminResult.createInstance(model.trainingTypeInfo);
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    model.traineeList = model.traineeList.map(tr => {
      tr.statusInfo = (lookupService.listByCategory.TRAINING_TRAINEE_STATUS.find(s => s.lookupKey == tr.status)!) || new Lookup();
      tr.trainee = (new Trainee()).clone(tr.trainee);
      tr.trainee.nationalityInfo = (lookupService.listByCategory.Nationality.find(s => s.lookupKey == tr.trainee.nationality)!) || new Lookup();
      return tr;
    });

    model.startDate = DateUtils.changeDateToDatepicker(model.startDate);
    model.endDate = DateUtils.changeDateToDatepicker(model.endDate);

    model.registerationStartDate = DateUtils.changeDateToDatepicker(model.registerationStartDate);
    model.registerationClosureDate = DateUtils.changeDateToDatepicker(model.registerationClosureDate);

    model.targetOrganizationListIds = convertIdsStringToArray(model.targetOrganizationList);
    model.optionalTargetOrganizationListIds = convertIdsStringToArray(model.optionalTargetOrganizationList);

    model.targetAudienceListIds = convertIdsStringToArray(model.targetAudienceList);

    TrainingProgramInterceptor._parseTrainingLanguages(model);
    model.trainerListIds = convertIdsStringToArray(model.trainerList);

    let trainingProgramBriefcaseService = FactoryService.getService<TrainingProgramBriefcaseService>('TrainingProgramBriefcaseService');
    model.trainingBundleList = model.trainingBundleList.map(item => trainingProgramBriefcaseService._getReceiveInterceptor()(new TrainingProgramBriefcase().clone(item)));
    return model;
  }

  send(model: Partial<TrainingProgram>): Partial<TrainingProgram> {
    model.targetOrganizationList = JSON.stringify(model.targetOrganizationListIds);
    model.optionalTargetOrganizationList = JSON.stringify(model.optionalTargetOrganizationListIds);
    model.targetAudienceList = JSON.stringify(model.targetAudienceListIds);
    model.trainerList = JSON.stringify(model.trainerListIds);

    model.startDate = DateUtils.getDateStringFromDate(model.startDate);
    model.endDate = DateUtils.getDateStringFromDate(model.endDate);
    model.registerationStartDate = DateUtils.getDateStringFromDate(model.registerationStartDate);
    model.registerationClosureDate = DateUtils.getDateStringFromDate(model.registerationClosureDate);

    model.durationInHours = +model.durationInHours!;
    if (!model.durationInHours)
      delete model.durationInHours
    model.durationInDays = +model.durationInDays!;
    if (!model.durationInDays)
      delete model.durationInDays

    model.averageDurationInHours = +model.averageDurationInHours!;
    model.numberOfSeats = +model.numberOfSeats!;
    model.totalTrainingCost = +model.totalTrainingCost!;

    let trainingProgramBriefcaseService = FactoryService.getService<TrainingProgramBriefcaseService>('TrainingProgramBriefcaseService');
    model.trainingBundleList = !model.trainingBundleList ? [] : model.trainingBundleList.map(item => trainingProgramBriefcaseService._getSendInterceptor()(new TrainingProgramBriefcase().clone(item)));

    TrainingProgramInterceptor._stringifyTrainingLanguages(model);
    TrainingProgramInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _parseTrainingLanguages(model: TrainingProgram) {
    try {
      let parseValue = JSON.parse(model.trainingLang);
      if (!CommonUtils.isValidValue(parseValue)) {
        model.trainingLangParsed = [];
      } else {
        if (!Array.isArray(parseValue)) {
          parseValue = [parseValue];
        }
        model.trainingLangParsed = parseValue;
      }
    } catch (_) {
      model.trainingLangParsed = [];
    }

  }

  private static _stringifyTrainingLanguages(model: Partial<TrainingProgram>): void {
    if (!model.trainingLangParsed) {
      model.trainingLangParsed = [];
    }
    model.trainingLang = JSON.stringify(model.trainingLangParsed ?? [])
  }

  private static _deleteBeforeSend(model: Partial<TrainingProgram>): void {
    delete model.service;
    delete model.trainingDate;
    delete model.registrationDate;
    delete model.targetAudienceListIds;
    delete model.trainerListIds;
    delete model.trainingTypeInfo;
    delete model.trainerInfoList;
    delete model.statusInfo;
    delete model.traineeList;
    delete model.startDateString;
    delete model.endDateString;
    delete model.registerationStartDateString;
    delete model.registerationClosureDateString;
    delete model.trainingLangParsed;
  }


}

function convertIdsStringToArray(val: string): any[] {
  let arr: any[] = [];

  try {
    arr = JSON.parse(val);
  } catch (err) {
  }

  return arr;
}
