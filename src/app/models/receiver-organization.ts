import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {IMyDateModel} from '@nodro7/angular-mydatepicker';

export class ReceiverOrganization extends SearchableCloneable<ReceiverOrganization>{
  id!: number;
  organizationArabicName!: string;
  organizationEnglishName!: string;
  headQuarterType!: number;
  establishmentDate!: IMyDateModel | string;
  country!: number;
  region!: string;
  city!: string;
  detailsAddress!: string;
  postalCode!: string;
  website!: string;
  organizationEmail!: string;
  firstSocialMedia!: string;
  secondSocialMedia!: string;
  thirdSocialMedia!: string;
}
