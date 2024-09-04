import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { ExternalCharity } from '@app/models/external-charity';
import { ExternalCharityFounder } from '@app/models/external-charity-founder';
import { ExternalCharityFounderInterceptor } from './external-charity-founder';
import { FileNetDocument } from '@app/models/file-net-document';


export class ExternalCharityInterceptor implements IModelInterceptor<ExternalCharity> {
  receive(model: ExternalCharity): (ExternalCharity) {
    model.requestDocumentList = model.requestDocumentList?.map(item=> new FileNetDocument().clone(item));

    return model;
  }

  send(model: Partial<ExternalCharity>): Partial<ExternalCharity> {
    const externalCharityFounderInterceptor = new ExternalCharityFounderInterceptor();

    model.founderList = model.founderList?.
      map(item => <ExternalCharityFounder>externalCharityFounderInterceptor.send(item));

    ExternalCharityInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<ExternalCharity> | any): void {

    delete model.searchFields;
    delete model.service;
    delete model.enName;
    delete model.arName;
    delete model.caseType;
    delete model.requestDocumentList


  }
}
