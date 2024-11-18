import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { Penalty } from "@app/models/penalty";
import { ProposedSanction } from "@app/models/proposed-sanction";

export class ProposedSanctionInterceptor implements IModelInterceptor<ProposedSanction> {
    send(model: Partial<ProposedSanction>): Partial<ProposedSanction> {
    
     ProposedSanctionInterceptor._deleteBeforeSend(model);
      return model;
    }
  
    receive(model: ProposedSanction): ProposedSanction {      
      model.penaltyInfo = new Penalty().clone(model.penaltyInfo);      
      return model;
    }

    private static _deleteBeforeSend(model: Partial<ProposedSanction> | any): void {
  
        delete model.searchFields;
        delete model.penaltyInfo;
      }
  }
  