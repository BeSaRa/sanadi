import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { ActionRegistryInterceptor } from './../model-interceptors/action-registry-interceptor';
import {AdminResult} from './admin-result';

const {send, receive} = new ActionRegistryInterceptor();

@InterceptModel({send , receive})
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

}
