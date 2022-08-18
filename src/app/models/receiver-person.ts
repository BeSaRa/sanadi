import {SearchableCloneable} from '@app/models/searchable-cloneable';

export class ReceiverPerson extends SearchableCloneable<ReceiverPerson>{
  id!: number;
  receiverNameLikePassport!: string;
  receiverEnglishNameLikePassport!: string;
  receiverJobTitle!: string;
  receiverNationality!: number;
  receiverIdentificationNumber!: string;
  receiverPassportNumber!: string;
  receiverPhone1!: string;
  receiverPhone2!: string;
}
