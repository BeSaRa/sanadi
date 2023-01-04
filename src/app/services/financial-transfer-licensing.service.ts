import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { BaseGenericEService } from '@app/generics/base-generic-e-service';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { FinancialTransferLicensingInterceptor } from '@app/model-interceptors/financial-transfer-licensing-interceptor';
import { FinancialTransferLicensing } from '@app/models/financial-transfer-licensing';
import { FinancialTransferLicensingSearchCriteria } from '@app/models/financial-transfer-licesing-search-criteria';
import { Observable } from 'rxjs';
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';
import { FactoryService } from './factory.service';
import { LicenseService } from './license.service';
import { UrlService } from './url.service';

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

  searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'subject','goal', 'createdOn', 'caseStatus', 'ouInfo', 'creatorInfo'];
  selectLicenseDisplayColumns: string[] = [];
  selectLicenseDisplayColumnsReport: string[] = [ 'licenseNumber','subject','goal', 'status', 'actions'];
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

}
