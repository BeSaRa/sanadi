import { AdminResult } from './admin-result';
import { InterceptModel } from "@decorators/intercept-model";
import { ActionRegistryInterceptor } from "@app/model-interceptors/action-registry-interceptor";
import { LangService } from '@app/services/lang.service';
import { FactoryService } from '@app/services/factory.service';
import { INames } from '@app/interfaces/i-names';
import { ServiceActionType } from '@app/enums/service-action-type.enum';

const { send, receive } = new ActionRegistryInterceptor()

@InterceptModel({ send, receive })

export class ActionRegistry {
  id!: number;
  caseId!: string;
  actionId!: number;
  userFrom!: number;
  userTo!: number;
  ouFrom!: number;
  ouTo!: number;
  comment!: string;
  time!: string;
  addedOn!: string;
  userInfo!: AdminResult;
  actionInfo!: AdminResult;
  userFromInfo!: AdminResult;
  userToInfo!: AdminResult;
  ouFromInfo!: AdminResult;
  ouToInfo!: AdminResult;
  statusDateModified!: string;
  updatedBy!: string;
  updatedOn!: string;
  clientData!: string;
  langService!: LangService;

  constructor() {
    this.langService = FactoryService.getService('LangService');
  }
  getActionName(actionId: number): string {
    if(actionId === ServiceActionType.Viewed){
      return this.langService.map.action_viewed
    }
    if(actionId === ServiceActionType.Updated){
      return this.langService.map.action_updated
    }
    return this.langService.map.action_others
  }
}

