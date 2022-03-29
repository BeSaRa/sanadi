import { HttpClient } from '@angular/common/http';
import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {EServiceGenericService} from '@app/generics/e-service-generic-service';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {InternalBankAccountApproval} from '@app/models/internal-bank-account-approval';
import {DialogService} from './dialog.service';
import {DynamicOptionsService} from './dynamic-options.service';
import {UrlService} from './url.service';
import {InternalBankAccountApprovalInterceptor} from '@app/model-interceptors/internal-bank-account-approval-interceptor';
import {FactoryService} from '@app/services/factory.service';
import {InternalBankAccountApprovalSearchCriteria} from '@app/models/internal-bank-account-approval-search-criteria';

@Injectable({
  providedIn: 'root'
})
export class InternalBankAccountApprovalService extends EServiceGenericService<InternalBankAccountApproval> {
  jsonSearchFile: string = '';
  interceptor: IModelInterceptor<InternalBankAccountApproval> = new InternalBankAccountApprovalInterceptor();
  serviceKey: keyof ILanguageKeys = 'menu_internal_bank_account_approval';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = [];

  constructor(public http: HttpClient,
              public dialog: DialogService,
              public domSanitizer: DomSanitizer,
              public cfr: ComponentFactoryResolver,
              public dynamicService: DynamicOptionsService,
              public urlService: UrlService) {
    super();
    FactoryService.registerService('InternalBankAccountApprovalService', this);
  }

  _getModel() {
      return InternalBankAccountApproval;
  }

  _getURLSegment(): string {
      return this.urlService.URLS.INTERNAL_BANK_ACCOUNT_APPROVAL;
  }

  _getInterceptor(): Partial<IModelInterceptor<InternalBankAccountApproval>> {
      return this.interceptor;
  }

  getSearchCriteriaModel<S extends InternalBankAccountApproval>(): InternalBankAccountApproval {
      return new InternalBankAccountApprovalSearchCriteria();
  }

  getCaseComponentName(): string {
      return 'InternalBankAccountApprovalComponent';
  }

  _getUrlService(): UrlService {
      return this.urlService;
  }
}
