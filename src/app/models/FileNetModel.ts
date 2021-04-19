import {AdminResult} from './admin-result';
import {Cloneable} from './cloneable';

export abstract class FileNetModel<T> extends Cloneable<T> {
  id!: string;
  createdBy!: string;
  createdByGeneralId!: number;
  createdByOUId!: number;
  createdByUserType!: number;
  createdOn!: string;
  lastModified!: string;
  lastModifier!: string;
  classDescription!: string;
  creatorInfo!: AdminResult;
  ouInfo!: AdminResult;
}
