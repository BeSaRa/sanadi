import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { ExternalCharityFounder } from '@app/models/external-charity-founder';
import { UserPreferencesInterceptor } from '@model-interceptors/user-preferences-interceptor';

export class ExternalCharityFounderInterceptor implements IModelInterceptor<ExternalCharityFounder> {
  receive(model: ExternalCharityFounder): (ExternalCharityFounder) {
   
    return model;
  }

  send(model:Partial<ExternalCharityFounder>): Partial<ExternalCharityFounder> {
  
    ExternalCharityFounderInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<ExternalCharityFounder> | any): void {
   
    delete model.searchFields;
   
  }
}
