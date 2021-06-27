import {Annotation} from './annotation';

export class CaseComment extends Annotation<CaseComment> {
  CLASSNAME!: string;
  editHistory!: CaseComment[];
}
