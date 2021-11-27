import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {TrainingProgram} from '@app/models/training-program';
import {AdminResult} from '@app/models/admin-result';
import {DateUtils} from '@app/helpers/date-utils';
import {Trainee} from '@app/models/trainee';
import {LookupService} from '@app/services/lookup.service';
import {FactoryService} from '@app/services/factory.service';

export class TrainingProgramInterceptor implements IModelInterceptor<TrainingProgram>{
  receive(model: TrainingProgram): TrainingProgram {
    const lookupService = FactoryService.getService('LookupService') as LookupService;

    model.registrationDate = DateUtils.getDateStringFromDate(model.registerationStartDate) + ' to ' + DateUtils.getDateStringFromDate(model.registerationClosureDate);
    model.trainingDate = DateUtils.getDateStringFromDate(model.startDate) + ' to ' + DateUtils.getDateStringFromDate(model.endDate);
    model.trainingTypeInfo = AdminResult.createInstance(model.trainingTypeInfo);
    model.statusInfo = AdminResult.createInstance(model.statusInfo);
    model.traineeList = model.traineeList.map(tr => {
      let statusInfo = (lookupService.listByCategory.TRAINING_TRAINEE_STATUS.find(s => s.lookupKey == tr.status)!);
      tr.statusInfo = statusInfo;
      tr.trainee = (new Trainee()).clone(tr.trainee);
      let nationalityInfo = (lookupService.listByCategory.Nationality.find(s => s.lookupKey == tr.trainee.nationality)!);
      tr.trainee.nationalityInfo = nationalityInfo;
      return tr;
    });

    model.startDate = DateUtils.changeDateToDatepicker(model.startDate);
    model.endDate = DateUtils.changeDateToDatepicker(model.endDate);

    model.registerationStartDate = DateUtils.changeDateToDatepicker(model.registerationStartDate);
    model.registerationClosureDate = DateUtils.changeDateToDatepicker(model.registerationClosureDate);

    model.targetOrganizationListIds = convertIdsStringToArray(model.targetOrganizationList);

    model.targetAudienceListIds = convertIdsStringToArray(model.targetAudienceList);

    model.trainerListIds = convertIdsStringToArray(model.trainerList);

    return model;
  }

  send(model: Partial<TrainingProgram>): Partial<TrainingProgram> {
    model.targetOrganizationList = JSON.stringify(model.targetOrganizationListIds);
    model.targetAudienceList = JSON.stringify(model.targetAudienceListIds);
    model.trainerList = JSON.stringify(model.trainerListIds);

    model.startDate = DateUtils.getDateStringFromDate(model.startDate);
    model.endDate = DateUtils.getDateStringFromDate(model.endDate);
    model.registerationStartDate = DateUtils.getDateStringFromDate(model.registerationStartDate);
    model.registerationClosureDate = DateUtils.getDateStringFromDate(model.registerationClosureDate);

    delete model.service;
    delete model.trainingDate;
    delete model.registrationDate;
    delete model.targetAudienceListIds;
    delete model.trainerListIds;
    delete model.trainingTypeInfo;
    delete model.trainerInfoList;
    delete model.statusInfo;
    delete model.traineeList;
    return model;
  }


}

function convertIdsStringToArray(val: string): any[] {
  let arr: any[] = [];

  try {
    arr = JSON.parse(val);
  }
  catch (err) {}

  return arr;
}
