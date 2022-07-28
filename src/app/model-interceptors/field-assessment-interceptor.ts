import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {FieldAssessment} from '@app/models/field-assessment';
import {AdminResult} from '@app/models/admin-result';
import {DateUtils} from '@helpers/date-utils';

export class FieldAssessmentInterceptor implements IModelInterceptor<FieldAssessment> {
  receive(model: FieldAssessment): FieldAssessment {
    model.statusInfo && (model.statusInfo = AdminResult.createInstance(model.statusInfo));
    model.typeInfo && (model.typeInfo = AdminResult.createInstance(model.typeInfo));
    model.statusDateModifiedString = DateUtils.getDateStringFromDate(model.statusDateModified);
    return model;
  }

  send(model: Partial<FieldAssessment>): Partial<FieldAssessment> {

    FieldAssessmentInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<FieldAssessment>): void {
    delete model.statusInfo;
    delete model.typeInfo;
    delete model.statusDateModified;
  }
}
