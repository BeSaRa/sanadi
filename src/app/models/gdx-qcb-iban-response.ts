import {ISearchFieldsMap} from "@app/types/types";
import {SearchableCloneable} from "./searchable-cloneable";
import {InterceptModel} from "@app/decorators/decorators/intercept-model";
import {GdxQcbIbanResponseInterceptor} from '@model-interceptors/gdx-qcb-iban-response-interceptor';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {INames} from '@contracts/i-names';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';

const gdxQcbIbanResponseInterceptor = new GdxQcbIbanResponseInterceptor();

@InterceptModel({
  send: gdxQcbIbanResponseInterceptor.send,
  receive: gdxQcbIbanResponseInterceptor.receive
})
export class GdxQcbIbanResponse extends SearchableCloneable<GdxQcbIbanResponse> {
  langService: LangService = FactoryService.getService('LangService');
  accountStatus!: string;
  bankCode!: string;
  bankNameArabic!: string;
  bankNameEnglish!: string;
  customerIban!: string;
  customerId!: string;
  customerType!: string;
  
  searchFields: ISearchFieldsMap<GdxQcbIbanResponse> = {
    ...normalSearchFields(['accountStatus', 'bankCode', 'bankNameArabic', 'bankNameEnglish', 'customerIban', 'customerId', 'customerType'])
  }
}
