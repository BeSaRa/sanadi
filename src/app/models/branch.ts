import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {Officer} from '@app/models/officer';
import {InterceptModel} from '@decorators/intercept-model';
import {BranchInterceptor} from '@app/model-interceptors/branch-interceptor';

const {receive, send} = new BranchInterceptor();

@InterceptModel({receive, send})
export class Branch extends SearchableCloneable<Branch> {
  fullName!: string;
  category!: number;
  branchAdjective!: number;
  usageAdjective!: number;
  zoneNumber!: string;
  streetNumber!: string;
  buildingNumber!: string;
  address!: string;
  tempId!: number;
  status!: number;
  branchContactOfficer: Officer[] = [];
  id!: number;
}
