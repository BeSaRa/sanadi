import {InterceptModel} from '@decorators/intercept-model';
import {GdxSjcResponseInterceptor} from '@model-interceptors/gdx-sjc-response-interceptor';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';

const {receive, send} = new GdxSjcResponseInterceptor();

@InterceptModel({receive, send})
export class GdxSjcMaritalStatusResponse {
  isMarried!: boolean;
  marriageDate!: string;

  langService: LangService;

  constructor() {
    this.langService = FactoryService.getService('LangService');
  }

  searchFields: ISearchFieldsMap<GdxSjcMaritalStatusResponse> = {
    ...normalSearchFields(['marriageDate']),
    married: (text) => (this.isMarried ? this.langService.map.lbl_yes : this.langService.map.lbl_no).toLowerCase().indexOf(text) > -1
  }
}
