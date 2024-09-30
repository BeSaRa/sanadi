import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { PenaltiesAndViolations } from "@app/models/penalties-and-violations";
import { ProposedSanctionInterceptor } from "./proposed-sanction-interceptor";
import { ProposedSanction } from "@app/models/proposed-sanction";

export class PenaltiesAndViolationsInterceptor implements IModelInterceptor<PenaltiesAndViolations> {
    send(model: Partial<PenaltiesAndViolations>): Partial<PenaltiesAndViolations> {
    const proposedSanctionInterceptor = new ProposedSanctionInterceptor();

    model.proposedSanction = model.proposedSanction?.map(item => proposedSanctionInterceptor.send(item) as ProposedSanction);
     PenaltiesAndViolationsInterceptor._deleteBeforeSend(model);
      return model;
    }
  
    receive(model: PenaltiesAndViolations): PenaltiesAndViolations {
      const proposedSanctionInterceptor = new ProposedSanctionInterceptor();
      model.proposedSanction = model.proposedSanction.map(item => new ProposedSanction().clone(proposedSanctionInterceptor.receive(item)) as ProposedSanction);
      return model;
    }

    private static _deleteBeforeSend(model: Partial<PenaltiesAndViolations> | any): void {
        delete model.service;
        delete model.lang;
        delete model.searchFields;
       
      }
  }
  