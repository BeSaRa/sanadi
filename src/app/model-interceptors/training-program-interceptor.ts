import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {TrainingProgram} from '@app/models/training-program';
import {AdminResult} from '@app/models/admin-result';
import {DateUtils} from '@app/helpers/date-utils';

export class TrainingProgramInterceptor implements IModelInterceptor<TrainingProgram>{
  receive(model: TrainingProgram): TrainingProgram {
    model.registrationDate = DateUtils.getDateStringFromDate(model.registerationStartDate) + ' to ' + DateUtils.getDateStringFromDate(model.registerationClosureDate);
    model.trainingDate = DateUtils.getDateStringFromDate(model.startDate) + ' - ' + DateUtils.getDateStringFromDate(model.endDate);
    model.trainingTypeInfo = AdminResult.createInstance(model.trainingTypeInfo);
    return model;
  }

  send(model: Partial<TrainingProgram>): Partial<TrainingProgram> {
    return model;
  }
}
