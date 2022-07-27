import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {AdminResult} from '@app/models/admin-result';

export class TransferFundsExecutiveManagement extends SearchableCloneable<TransferFundsExecutiveManagement>{
  frontId!: number;
  nameLikePassport!: string;
  enNameLikePassport!: string;
  jobTitle!: string;
  executiveNationality!: number;
  executiveIdentificationNumber!: string;
  executivephone1!: string;
  executivephone2!: string;
  passportNumber!: string;
  executiveNationalityInfo!: AdminResult;
}
