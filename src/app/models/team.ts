import {Cloneable} from './cloneable';

export class Team extends Cloneable<Team> {
  arName!: string;
  enName!: string;
  authName!: string;
  autoClaim!: boolean;
  id!: number;
  isBAWRole!: boolean;
  isHidden!: boolean;
  ldapGroupName!: string;
  parentId!: number;
  updatedBy!: number;
}
