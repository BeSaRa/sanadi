import {FinancialTransfersProject} from '@app/models/financial-transfers-project';
import {ExternalProjectLicensing} from '@models/external-project-licensing';
import {
  SelectBankAccountPopupComponent
} from '@modules/e-services-main/popups/select-bank-account-popup/select-bank-account-popup.component';
import {BankAccount} from '@models/bank-account';
import {
  SelectPreRegisteredPopupComponent
} from '@modules/services/financial-transfer-licensing/popups/select-pre-registered-popup/select-pre-registered-popup.component';
import {
  SelectAuthorizedEntityPopupComponent
} from '@modules/services/financial-transfer-licensing/popups/select-authorized-entity-popup/select-authorized-entity-popup.component';
import {AdminResult} from '@app/models/admin-result';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {CastResponse, CastResponseContainer,} from '@app/decorators/decorators/cast-response';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {FinancialTransferLicensingInterceptor} from '@app/model-interceptors/financial-transfer-licensing-interceptor';
import {FinancialTransferLicensing} from '@app/models/financial-transfer-licensing';
import {FinancialTransferLicensingSearchCriteria} from '@app/models/financial-transfer-licesing-search-criteria';
import {Observable} from 'rxjs';
import {DialogService} from './dialog.service';
import {DynamicOptionsService} from './dynamic-options.service';
import {FactoryService} from './factory.service';
import {LicenseService} from './license.service';
import {UrlService} from './url.service';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {
  FinancialTransferLicensingApprovePopupComponent
} from '@app/modules/services/financial-transfer-licensing/popups/financial-transfer-licensing-approve-popup/financial-transfer-licensing-approve-popup.component';

@CastResponseContainer({
  $default: {
    model: () => FinancialTransferLicensing,
  },
})
@Injectable({
  providedIn: 'root',
})
export class FinancialTransferLicensingService extends BaseGenericEService<FinancialTransferLicensing> {
  constructor(
    private urlService: UrlService,
    public domSanitizer: DomSanitizer,
    public dynamicService: DynamicOptionsService,
    public dialog: DialogService,
    private licenseService: LicenseService,
    public http: HttpClient
  ) {
    super();
    FactoryService.registerService('FinancialTransferLicensingService', this);
  }

  searchColumns: string[] = [
    'fullSerial',
    'requestTypeInfo',
    'subject',
    'createdOn',
    'caseStatus',
    'ouInfo',
    'creatorInfo',
  ];

  selectLicenseDisplayColumns: string[] = [];
  selectLicenseDisplayColumnsReport: string[] = [
    'licenseNumber',
    'subject',
    'status',
    'actions',
  ];

  serviceKey: keyof ILanguageKeys = 'menu_financial_transfers_licensing';
  jsonSearchFile: string = 'financial_transfers_licensing.json';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  interceptor: IModelInterceptor<FinancialTransferLicensing> =
    new FinancialTransferLicensingInterceptor();

  _getInterceptor(): Partial<IModelInterceptor<FinancialTransferLicensing>> {
    return this.interceptor;
  }

  _getModel(): any {
    return FinancialTransferLicensing;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.FINANCIAL_TRANSFERS_LICENSING;
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }

  getCaseComponentName(): string {
    return 'FinancialTransfersLicensingComponent';
  }

  private _getBankAccountCtrlURLSegment(): string {
    return this.urlService.URLS.BANK_ACCOUNT;
  }

  @CastResponse(() => BankAccount)
  private _loadOrganizationBankAccounts(
    orgId: number
  ): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(
      this._getBankAccountCtrlURLSegment() + '/criteria'
    );
  }

  loadOrganizationBankAccounts(orgId: number) {
    return this._loadOrganizationBankAccounts(orgId);
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _loadExternalProjects(): Observable<ExternalProjectLicensing[]> {
    return this.http.post<ExternalProjectLicensing[]>(
      this._getURLSegment() + '/external-project-license/search',
      {}
    );
  }

  loadEternalProjects() {
    return this._loadExternalProjects();
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _loadExternalProjectsDetails(licenseId: string): Observable<FinancialTransfersProject> {
    return this.http.get<FinancialTransfersProject>(
      this._getURLSegment() + '/external-project-details/' + licenseId + '/details');
  }
  loadEternalProjectsDetails(licenseId: string) {
    return this._loadExternalProjectsDetails(licenseId);
  }
  getSearchCriteriaModel<
    S extends FinancialTransferLicensing
  >(): FinancialTransferLicensing {
    return new FinancialTransferLicensingSearchCriteria();
  }
  licenseSearch(
    criteria: Partial<FinancialTransferLicensingSearchCriteria> = {}
  ): Observable<FinancialTransferLicensing[]> {
    return this.licenseService.FinancialTransferLicensingSearch(criteria);
  }
  openAuthorizedSelect(
    entities: AdminResult[],
    select: boolean,
    displayedColumns: string[],
    service: BaseGenericEService<any>
  ) {
    return this.dialog.show(SelectAuthorizedEntityPopupComponent, {
      entities,
      select,
      displayedColumns,
      service,
    });
  }
  openPreRegisteredSelect(
    entities: FinancialTransferLicensing[],
    select: boolean,
    displayedColumns: string[]
  ) {
    return this.dialog.show(SelectPreRegisteredPopupComponent, {
      entities,
      select,
      displayedColumns,
    });
  }
  openBankAccountSelect(
    entities: BankAccount[],
    select: boolean,
    displayedColumns: string[]
  ) {
    return this.dialog.show(SelectBankAccountPopupComponent, {
      entities,
      select,
      displayedColumns,
    });
  }
  approve(model: FinancialTransferLicensing, action: WFResponseType): DialogRef {
    return this.dialog.show(FinancialTransferLicensingApprovePopupComponent, {
      model,
      action
    });
  }
  finalApprove(model: FinancialTransferLicensing, action: WFResponseType): DialogRef {
    return this.dialog.show(FinancialTransferLicensingApprovePopupComponent, {
      model,
      action
    });
  }
}
