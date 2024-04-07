import { ProposedInspection } from '@app/models/proposed-inspection';
import {Sector} from '@app/models/sector';
import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {AdminResult} from "@models/admin-result";

export class ProposedInspectionInterceptor implements IModelInterceptor<ProposedInspection> {
  receive(model: ProposedInspection): ProposedInspection {
    model.departmentInfo && (model.departmentInfo = AdminResult.createInstance(model.departmentInfo??{}));
    model.statusInfo && (model.statusInfo = AdminResult.createInstance(model.statusInfo??{}));
    model.proposedTaskTypeInfo && (model.proposedTaskTypeInfo = AdminResult.createInstance(model.proposedTaskTypeInfo??{}));
    model.priorityInfo && (model.priorityInfo = AdminResult.createInstance(model.priorityInfo??{}));
    return model;
  }

  send(model: Partial<ProposedInspection>): Partial<ProposedInspection> {
    ProposedInspectionInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<ProposedInspection> | any): void {
    delete model.service;
    delete model.departmentInfo;
    delete model.statusInfo;
    delete model.proposedTaskTypeInfo;
    delete model.ProposedTaskTypeInfo;
    delete model.priorityInfo;
    delete model.arName;
    delete model.enName

  }

}
