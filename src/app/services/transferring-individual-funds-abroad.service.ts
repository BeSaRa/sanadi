import {HttpClient} from '@angular/common/http';
import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {TransferringIndividualFundsAbroad} from '@app/models/transferring-individual-funds-abroad';
import {DialogService} from './dialog.service';
import {DynamicOptionsService} from './dynamic-options.service';
import {UrlService} from './url.service';
import {FactoryService} from '@services/factory.service';
import {TransferringIndividualFundsAbroadSearchCriteria} from '@app/models/transferring-individual-funds-abroad-search-criteria';
import {CastResponseContainer} from '@decorators/cast-response';
import {ExecutiveManagementListInterceptor} from '@app/model-interceptors/executive-management-list-interceptor';
import {TransferFundsCharityPurposeInterceptor} from '@app/model-interceptors/transfer-funds-charity-purpose-interceptor';

@CastResponseContainer({
  $default: {
    model: () => TransferringIndividualFundsAbroad
  }
})
@Injectable({
  providedIn: 'root'
})
export class TransferringIndividualFundsAbroadService extends BaseGenericEService<TransferringIndividualFundsAbroad> {
  constructor(private urlService: UrlService,
              public domSanitizer: DomSanitizer,
              public cfr: ComponentFactoryResolver,
              public dialog: DialogService,
              public dynamicService: DynamicOptionsService,
              public http: HttpClient) {
    super();
    FactoryService.registerService('TransferringIndividualFundsAbroadService', this);
  }

  jsonSearchFile: string = 'transferring-individual-funds-abroad-search.json';
  serviceKey: keyof ILanguageKeys = 'menu_transferring_individual_funds_abroad';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = ['fullSerial', 'fullName', 'subject', 'caseStatus', 'creatorInfo', 'createdOn'];
  executiveManagementListInterceptor: ExecutiveManagementListInterceptor = new ExecutiveManagementListInterceptor();
  transferFundsCharityPurposeInterceptor: TransferFundsCharityPurposeInterceptor = new TransferFundsCharityPurposeInterceptor();

  _getURLSegment(): string {
    return this.urlService.URLS.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD;
  }

  _getModel() {
    return TransferringIndividualFundsAbroad
  }

  getSearchCriteriaModel<S extends TransferringIndividualFundsAbroad>(): TransferringIndividualFundsAbroad {
    return new TransferringIndividualFundsAbroadSearchCriteria();
  }

  getCaseComponentName(): string {
    return 'TransferringIndividualFundsAbroadComponent';
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }
}
