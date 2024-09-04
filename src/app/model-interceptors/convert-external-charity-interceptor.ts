import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { ConvertExternalCharity } from "@app/models/convert-external-charity";
import { ExternalCharityFounderInterceptor } from "./external-charity-founder";
import { ExternalCharityFounder } from "@app/models/external-charity-founder";
import { FileNetDocument } from "@app/models/file-net-document";
import { FileNetDocumentInterceptor } from "./file-net-document-interceptor";

export class ConvertExternalCharityInterceptor implements IModelInterceptor<ConvertExternalCharity> {
    receive(model: ConvertExternalCharity): (ConvertExternalCharity) {
      model.requestDocumentList = model.requestDocumentList?.map(item=> new FileNetDocument().clone(item));
      return model;
    }
  
    send(model:Partial<ConvertExternalCharity>): Partial<ConvertExternalCharity> {
      const externalCharityFounderInterceptor = new ExternalCharityFounderInterceptor();
      model.founderList = model.founderList?.
      map(item=><ExternalCharityFounder>externalCharityFounderInterceptor.send(item));
      
      
      ConvertExternalCharityInterceptor._deleteBeforeSend(model);
      return model;
    }
  
    private static _deleteBeforeSend(model: Partial<ConvertExternalCharity> | any): void {
     
      delete model.searchFields;
      delete model.employeeService;
      delete model.service;
      delete model.enName;
      delete model.arName;
      delete model.caseType;
      delete model.requestDocumentList

     
    }
  }
  