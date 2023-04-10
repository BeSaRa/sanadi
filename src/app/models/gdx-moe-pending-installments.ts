import {InterceptModel} from '@decorators/intercept-model';
import {GdxMoeResponseInterceptor} from '@app/model-interceptors/gdx-moe-response-interceptor';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import { GdxMoeInstallment } from './gdx-moe-Installment';
import { GdxMoePrivateSchoolPendingPayment } from './gdx-moe-private-school-pending-payment';
import { ISearchFieldsMap } from '@app/types/types';
import { normalSearchFields } from '@app/helpers/normal-search-fields';

const gdxMoeResponseInterceptor = new GdxMoeResponseInterceptor();

@InterceptModel({
  receive: gdxMoeResponseInterceptor.receive
})
export class GdxMoeResponse extends SearchableCloneable<GdxMoeResponse>{
  studentQID! : String;
  gradeLevelEN! : String;
  gradeLevelAR! : String;
  studentNameEN! : String;
  schoolNameAR! : String;
  schoolNameEN! : String;
  installments!: GdxMoeInstallment[];
  privateSchoolPendingPayment!:GdxMoePrivateSchoolPendingPayment[];
  
  //extra properties
  dummyIdentifier!: number;
  searchFields: ISearchFieldsMap<GdxMoeResponse> = {
    ...normalSearchFields(['studentQID', 'gradeLevelEN', 'gradeLevelAR', 'studentNameEN', 'schoolNameAR', 'schoolNameEN'])
  }
}
