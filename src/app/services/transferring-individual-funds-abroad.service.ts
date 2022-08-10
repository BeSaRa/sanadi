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
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {
  TransferFundsAbroadApproveTaskPopupComponent
} from '@app/projects/popups/transfer-funds-abroad-approve-task-popup/transfer-funds-abroad-approve-task-popup.component';

@CastResponseContainer({
  $default: {
    model: () => TransferringIndividualFundsAbroad
  }
})
@Injectable({
  providedIn: 'root'
})
export class TransferringIndividualFundsAbroadService extends BaseGenericEService<TransferringIndividualFundsAbroad> {
  jsonSearchFile: string = 'transferring-individual-funds-abroad-search.json';
  serviceKey: keyof ILanguageKeys = 'menu_transferring_individual_funds_abroad';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = ['fullSerial', 'arName', 'enName', 'subject', 'caseStatus', 'creatorInfo', 'createdOn'];
  executiveManagementListInterceptor: ExecutiveManagementListInterceptor = new ExecutiveManagementListInterceptor();
  transferFundsCharityPurposeInterceptor: TransferFundsCharityPurposeInterceptor = new TransferFundsCharityPurposeInterceptor();

  constructor(private urlService: UrlService,
              public domSanitizer: DomSanitizer,
              public cfr: ComponentFactoryResolver,
              public dialog: DialogService,
              public dynamicService: DynamicOptionsService,
              public http: HttpClient) {
    super();
    FactoryService.registerService('TransferringIndividualFundsAbroadService', this);
  }

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

  approveTask(model: TransferringIndividualFundsAbroad, action: WFResponseType): DialogRef {
    return this.dialog.show(TransferFundsAbroadApproveTaskPopupComponent, {
      model,
      action: action
    });
  }

  finalApproveTask(model: TransferringIndividualFundsAbroad, action: WFResponseType): DialogRef {
    return this.dialog.show(TransferFundsAbroadApproveTaskPopupComponent, {
      model,
      action: action
    });
  }
}
