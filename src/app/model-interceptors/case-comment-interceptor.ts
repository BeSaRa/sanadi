import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {CaseComment} from '../models/case-comment';
import {AdminResult} from '../models/admin-result';

export class CaseCommentInterceptor implements IModelInterceptor<CaseComment> {
  receive(model: CaseComment): CaseComment {
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    return model;
  }

  send(model: any): any {
    delete model.creatorInfo;
    delete model.ouInfo;
    return model;
  }
}
