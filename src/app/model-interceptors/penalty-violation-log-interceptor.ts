import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { ProposedSanctionInterceptor } from "./proposed-sanction-interceptor";
import { ProposedSanction } from "@app/models/proposed-sanction";
import { PenaltyViolationLog } from "@app/models/penalty-violation-log";
import { PenaltiesAndViolationsInterceptor } from "./penalties-and-violations-interceptor";
import { DateUtils } from "@app/helpers/date-utils";
import { AdminResult } from "@app/models/admin-result";
import { Penalty } from "@app/models/penalty";

export class PenaltyViolationLogInterceptor implements IModelInterceptor<PenaltyViolationLog> {
    send(model: Partial<PenaltyViolationLog>): Partial<PenaltyViolationLog> {
    
      return model;
    }
  
    receive(model: PenaltyViolationLog): PenaltyViolationLog {
      const penaltiesAndViolationsInterceptor = new PenaltiesAndViolationsInterceptor();
      model.case = penaltiesAndViolationsInterceptor.receive(JSON.parse(model.caseObject)) ;
      model.penaltiesInfo = model.penaltiesInfo?.map(item => new Penalty().clone(item));
      model.organizationInfo = AdminResult.createInstance(model.organizationInfo);
      model.updatedOnString=  DateUtils.getDateStringFromDate(model.updatedOn);
      model.penaltyDateString=  DateUtils.getDateStringFromDate(model.penaltyDate);
      model.penaltiesInfoString =  model.penaltiesInfo?.reduce((acc, item, index) => 
        index === model.penaltiesInfo.length - 1 ? acc + item.getName() : acc + item.getName() + ', ', '');
      return model;
    }

    private static _deleteBeforeSend(model: Partial<PenaltyViolationLog> | any): void {
        delete model.service;
        delete model.lang;
        delete model.searchFields;
       
      }
  }
  