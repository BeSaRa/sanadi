import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { GoveranceDocument } from '@app/models/goverance-document';
import { ForeignAidClassificationInterceptor } from './foreign-aid-classification-interceptor';

export class GoveranceDocumentInterceptor implements IModelInterceptor<GoveranceDocument>{
  receive(model: GoveranceDocument): GoveranceDocument {
    const foreignAidClassificationInterceptor = new ForeignAidClassificationInterceptor();
    model.workFieldClassificationList = model.workFieldClassificationList.map(e => foreignAidClassificationInterceptor.receive(e));
    return model;
  }

  send(model: Partial<GoveranceDocument>): Partial<GoveranceDocument> {
    return model;
  }
}
