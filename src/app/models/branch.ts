import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {Officer} from '@app/models/officer';

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
