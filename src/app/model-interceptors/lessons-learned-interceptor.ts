import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {LessonsLearned} from '@app/models/lessons-learned';
import {AdminResult} from '@app/models/admin-result';

export class LessonsLearnedInterceptor implements IModelInterceptor<LessonsLearned> {
  receive(model: LessonsLearned): LessonsLearned {
    model.lessonsLearnedInfo = model.lessonsLearnedInfo.map(x => {
      return AdminResult.createInstance(x);
    });
    return model;
  }

  send(model: Partial<LessonsLearned>): Partial<LessonsLearned> {
    LessonsLearnedInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<LessonsLearned>): void {
    delete model.auditOperation;
    delete model.lessonsLearnedInfo;
    delete model.langService;
    delete model.searchFields;
  }
}
