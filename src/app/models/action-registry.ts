import {AdminResult} from './admin-result';

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
