import {SearchableCloneable} from '@app/models/searchable-cloneable';

export class Officer extends SearchableCloneable<Officer> {
  qid!: string;
  fullName!: string;
  email!: string;
  phone!: string;
  extraPhone!: string;
  status!: number;
  tempId!: number;
  jobTitleId!: number;
  id!: number;
}
