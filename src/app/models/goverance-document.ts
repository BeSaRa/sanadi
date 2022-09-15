import { Bylaw } from './bylaw';
import { CharityOrganizationUpdate } from './charity-organization-update';
import { ForeignAidClassification } from './foreign-aid-classification';
import { SearchableCloneable } from './searchable-cloneable';
import { WorkArea } from './work-area';

export class GoveranceDocument extends SearchableCloneable<GoveranceDocument> {
  charityId!: number;
  charityWorkArea!: number;
  goals!: string;
  firstReleaseDate!: string;
  lastUpdateDate!: string;
  wfClassificationList!: ForeignAidClassification[];
  byLawList!: Bylaw[];
  workAreaList!: WorkArea[];
  id!: number;
  toCharityOrgnizationUpdate() {
    const { charityId, charityWorkArea, firstReleaseDate, lastUpdateDate, goals, wfClassificationList, workAreaList, byLawList } = this;
    return new CharityOrganizationUpdate().clone({
      charityId,
      charityWorkArea,
      firstReleaseDate,
      lastUpdateDate,
      goals,
      wFClassificationList: wfClassificationList.map(e => new ForeignAidClassification().clone({ ...e }).toCharityOrgnizationUpdate()),
      workAreaObjectList: workAreaList.map(e => new WorkArea().clone({ ...e }).toCharityOrgnizationUpdate()),
      byLawList: byLawList.map(e => new Bylaw().clone({ ...e }).toCharityOrgnizationUpdate())
    })
  }
}
