import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { GoveranceDocumentInterceptor } from '@app/model-interceptors/goverence-document-interceptor';
import { Bylaw } from './bylaw';
import { CharityOrganizationUpdate } from './charity-organization-update';
import { ForeignAidClassification } from './foreign-aid-classification';
import { SearchableCloneable } from './searchable-cloneable';
import { WorkArea } from './work-area';
import { ByLawInterceptor } from '@app/model-interceptors/bylaw-interceptor';

const { send, receive } = new GoveranceDocumentInterceptor();
const byLawInterceptor = new ByLawInterceptor();

@InterceptModel({
  send,
  receive
})
export class GoveranceDocument extends SearchableCloneable<GoveranceDocument> {
  charityId!: number;
  charityWorkArea!: number;
  goals!: string;
  firstReleaseDate!: string;
  lastUpdateDate!: string;
  workFieldClassificationList!: ForeignAidClassification[];
  byLawList!: Bylaw[];
  workAreaList!: WorkArea[];
  id!: number;
  toCharityOrgnizationUpdate() {
    const { charityId, charityWorkArea, firstReleaseDate, lastUpdateDate, goals, workFieldClassificationList, workAreaList, byLawList } = this;
    return new CharityOrganizationUpdate().clone({
      charityId,
      charityWorkArea,
      firstReleaseDate,
      lastUpdateDate,
      goals,
      workFieldClassificationList: workFieldClassificationList.map(e => new ForeignAidClassification().clone({ ...e }).toCharityOrgnizationUpdate()),
      workAreaObjectList: workAreaList.map(e => new WorkArea().clone({ ...e }).toCharityOrgnizationUpdate()),
      byLawList: byLawList.map(e => new Bylaw().clone(byLawInterceptor.receive(e)).toCharityOrgnizationUpdate())
    })
  }
}
