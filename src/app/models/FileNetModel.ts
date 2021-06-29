import {AdminResult} from './admin-result';
import {SearchableCloneable} from './searchable-cloneable';

export abstract class FileNetModel<T> extends SearchableCloneable<T> {
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
