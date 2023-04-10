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
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {ExecutiveManagementListInterceptor} from '@app/model-interceptors/executive-management-list-interceptor';
import {TransferFundsCharityPurposeInterceptor} from '@app/model-interceptors/transfer-funds-charity-purpose-interceptor';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {
  TransferFundsAbroadApproveTaskPopupComponent
} from '@app/modules/services/transferring-individual-funds-abroad/popups/transfer-funds-abroad-approve-task-popup/transfer-funds-abroad-approve-task-popup.component';
import {Observable} from 'rxjs';
import {ReceiverOrganization} from '@app/models/receiver-organization';
import {SelectReceiverEntityPopupComponent} from '@app/modules/services/transferring-individual-funds-abroad/popups/select-receiver-entity-popup/select-receiver-entity-popup.component';
import {ReceiverPerson} from '@app/models/receiver-person';
import {
  TransferFundsAbroadCompleteTaskPopupComponent
} from '@app/modules/services/transferring-individual-funds-abroad/popups/transfer-funds-abroad-complete-task-popup/transfer-funds-abroad-complete-task-popup.component';
import {UntypedFormGroup} from '@angular/forms';
import {TransferFundsExecutiveManagement} from '@app/models/transfer-funds-executive-management';
import {TransferFundsCharityPurpose} from '@app/models/transfer-funds-charity-purpose';
import {PaymentInterceptor} from '@app/model-interceptors/payment-interceptor';

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
  searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'arName', 'enName', 'subject', 'caseStatus', 'creatorInfo', 'createdOn'];
  executiveManagementListInterceptor: ExecutiveManagementListInterceptor = new ExecutiveManagementListInterceptor();
  transferFundsCharityPurposeInterceptor: TransferFundsCharityPurposeInterceptor = new TransferFundsCharityPurposeInterceptor();
  paymentInterceptor: PaymentInterceptor = new PaymentInterceptor();

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

  completeTask(model: TransferringIndividualFundsAbroad, action: WFResponseType, form: UntypedFormGroup, selectedExecutives: TransferFundsExecutiveManagement[], selectedPurposes: TransferFundsCharityPurpose[]): DialogRef {
    return this.dialog.show(TransferFundsAbroadCompleteTaskPopupComponent, {
      model,
      action: action,
      service: this,
      form,
      selectedExecutives,
      selectedPurposes
    });
  }

  getTransferringEntityUrl() {
    return this.urlService.URLS.TRANSFERRING_ENTITY;
  }

  @CastResponse(() => ReceiverOrganization, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _searchReceiverOrganizations(criteria: {arabicName?: string, englishName?: string}): Observable<ReceiverOrganization[]> {
    const secondPartOfUrl = '/transferring-entity/org?' + (criteria.arabicName ? 'organization-arabic-name=' + criteria.arabicName : 'organization-english-name=' + criteria.englishName);
    return this.http.get<ReceiverOrganization[]>(this.getTransferringEntityUrl() + secondPartOfUrl);
  }

  searchReceiverOrganizations(criteria: {arabicName?: string, englishName?: string}): Observable<ReceiverOrganization[]> {
    return this._searchReceiverOrganizations(criteria);
  }

  openSelectReceiverOrganizationDialog(receiverOrganizations: ReceiverOrganization[], displayedColumns: string[], select: boolean = true): DialogRef {
    return this.dialog.show(SelectReceiverEntityPopupComponent, {
      entities: receiverOrganizations,
      select,
      displayedColumns
    });
  }

  @CastResponse(() => ReceiverPerson, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _searchReceiverPersons(criteria: {localName?: string, englishName?: string}): Observable<ReceiverPerson[]> {
    const secondPartOfUrl = '/transferring-entity/individual?' + (criteria.localName ? 'receiver-name=' + criteria.localName : 'receiver-english-name=' + criteria.englishName);
    return this.http.get<ReceiverPerson[]>(this.getTransferringEntityUrl() + secondPartOfUrl);
  }

  searchReceiverPersons(criteria: {localName?: string, englishName?: string}): Observable<ReceiverPerson[]> {
    return this._searchReceiverPersons(criteria);
  }

  openSelectReceiverPersonDialog(receiverPersons: ReceiverPerson[], displayedColumns: string[], select: boolean = true): DialogRef {
    return this.dialog.show(SelectReceiverEntityPopupComponent, {
      entities: receiverPersons,
      select,
      displayedColumns
    });
  }

  @CastResponse(() => TransferringIndividualFundsAbroad)
  private _getByLicenseId(licenseId: string): Observable<TransferringIndividualFundsAbroad> {
    return this.http.get<TransferringIndividualFundsAbroad>(this._getURLSegment() + '/license/' + licenseId + '/details');
  }

  getByLicenseId(licenseId: string): Observable<TransferringIndividualFundsAbroad> {
    return this._getByLicenseId(licenseId);
  }
}
