import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {InterceptModel} from '@decorators/intercept-model';
import {OfficerInterceptor} from '@app/model-interceptors/officer-interceptor';

const {receive, send} = new OfficerInterceptor();

@InterceptModel({receive, send})
export class Officer extends SearchableCloneable<Officer> {
  qid!: string;
  fullName!: string;
  email!: string;
  phone!: string;
  extraPhone!: string;
  status!: number;
  tempId!: number;
  jobTitle!: string;
  id!: number;
}
