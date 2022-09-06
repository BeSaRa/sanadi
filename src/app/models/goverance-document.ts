import { SearchableCloneable } from './searchable-cloneable';

export class GoveranceDocument extends SearchableCloneable<GoveranceDocument> {
  updatedBy!: number;
  clientData!: string;
  charityId!: number;
  charityWorkArea!: number;
  goals!: string;
  firstReleaseDate!: string;
  lastUpdateDate!: string;
  wfClassificationList!: [];
  workAreaList!: [];
  byLawList!: [];
  id!: number;
}
