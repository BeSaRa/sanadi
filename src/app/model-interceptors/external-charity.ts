import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { ExternalCharity } from '@app/models/external-charity';
import { ExternalCharityFounder } from '@app/models/external-charity-founder';
import { ExternalCharityLog } from '@app/models/external-charity-log';
import { FileNetDocument } from '@app/models/file-net-document';
import { ExternalCharityFounderInterceptor } from './external-charity-founder';
import { ExternalCharityLogInterceptor } from './external-charity-log-interceptor';
import { FileNetDocumentInterceptor } from './file-net-document-interceptor';


export class ExternalCharityInterceptor implements IModelInterceptor<ExternalCharity> {
  receive(model: ExternalCharity): (ExternalCharity) {
    model.requestDocumentList = model.requestDocumentList?.map(item => new FileNetDocument().clone({...item,
      attachmentTypeInfo : AdminResult.createInstance(item.attachmentTypeInfo??{})
    }
  ));
    if(!!model.logList){
      const auditInterceptor= new ExternalCharityLogInterceptor();
      model.logList = model.logList?.map(item=> <ExternalCharityLog>auditInterceptor.receive(item));
    }
    return model;
  }

  send(model: Partial<ExternalCharity>): Partial<ExternalCharity> {
    const externalCharityFounderInterceptor = new ExternalCharityFounderInterceptor();
    const externalCharityLogInterceptor= new ExternalCharityLogInterceptor();
    const fileNetDocumentInterceptor = new FileNetDocumentInterceptor();

    model.requestDocumentList = model.requestDocumentList?.map(item => <FileNetDocument>fileNetDocumentInterceptor.send(item));
    model.logList = model.logList?.map(item=> <ExternalCharityLog>externalCharityLogInterceptor.send(item));

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
