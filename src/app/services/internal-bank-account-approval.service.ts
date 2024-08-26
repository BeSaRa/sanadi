import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { InternalBankAccountApproval } from '@app/models/internal-bank-account-approval';
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';
import { UrlService } from './url.service';
import {
  InternalBankAccountApprovalInterceptor
} from '@app/model-interceptors/internal-bank-account-approval-interceptor';
import { FactoryService } from '@app/services/factory.service';
import { InternalBankAccountApprovalSearchCriteria } from '@app/models/internal-bank-account-approval-search-criteria';
import { Observable } from 'rxjs';
import { Bank } from '@app/models/bank';
import { BankAccount } from '@app/models/bank-account';
import { map } from 'rxjs/operators';
import { NpoEmployee } from '@app/models/npo-employee';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { DialogRef } from '@app/shared/models/dialog-ref';
import {
  InternalBankApprovalApproveTaskPopupComponent
} from '@app/modules/services/internal-bank-account-approval/popups/internal-bank-approval-approve-task-popup/internal-bank-approval-approve-task-popup.component';
import { BankService } from '@services/bank.service';
import {
  SelectEmployeePopupComponent
} from '@app/modules/services/internal-bank-account-approval/popups/select-employee-popup/select-employee-popup.component';
import { Lookup } from '@app/models/lookup';
import { CastResponse, CastResponseContainer } from '@decorators/cast-response';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";

@CastResponseContainer({
  $default: {
    model: () => InternalBankAccountApproval
  }
})
@Injectable({
  providedIn: 'root'
})
export class InternalBankAccountApprovalService extends BaseGenericEService<InternalBankAccountApproval> {
  jsonSearchFile: string = 'internal_bank_account_approval_search.json';
  interceptor: IModelInterceptor<InternalBankAccountApproval> = new InternalBankAccountApprovalInterceptor();
  serviceKey: keyof ILanguageKeys = 'menu_internal_bank_account_approval';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'subject', 'caseStatus', 'ouInfo', 'creatorInfo', 'createdOn'];

  constructor(public http: HttpClient,
              public dialog: DialogService,
              public domSanitizer: DomSanitizer,
              public dynamicService: DynamicOptionsService,
              public urlService: UrlService,
              private _bankService: BankService) {
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

  getBankAccountCtrlURLSegment(): string {
    return this.urlService.URLS.BANK_ACCOUNT;
  }

  @CastResponse(()=> BankAccount)
  private _loadBankAccounts(): Observable<BankAccount[]> {
    return this.http.get<any>(this.getBankAccountCtrlURLSegment() + '/lookup');
  }

  loadBankAccounts() {
    return this._loadBankAccounts().pipe(map(response => {
      let result: BankAccount[] = [];
      response.forEach((r: BankAccount) => {
        r.bankInfo = (new Bank()).clone(r.bankInfo);
        result.push((new BankAccount()).clone(r));
      });
      return result;
    }));
  }

  @CastResponse(() => BankAccount)
  private _loadBankAccountsBasedOnCurrencyAndBank(bankId: number, currencyId: number): Observable<BankAccount[]> {
    return this.http.get<any>(this.getBankAccountCtrlURLSegment() + '/criteria?bank-id=' + bankId + '&currency=' + currencyId);
  }
  @CastResponse(() => BankAccount)
  private _loadBankAccountsById(bankId: number): Observable<BankAccount[]> {
    return this.http.get<any>(this.getBankAccountCtrlURLSegment() + '/criteria',{
      params:new HttpParams({
        fromObject:{
          'bank-id':bankId
        }
      })
    });
  }

  loadBankAccountsBasedOnCurrencyAndBank(bankId: number, currencyId: number) {
    return this._loadBankAccountsBasedOnCurrencyAndBank(bankId, currencyId).pipe(map(response => {
      let result: BankAccount[] = [];
      response.forEach((r: BankAccount) => {
        r.bankInfo = (new Bank()).clone(r.bankInfo);
        result.push((new BankAccount()).clone(r));
      });
      return result;
    }));
  }
  loadBankAccountsById(bankId: number) {
    return this._loadBankAccountsById(bankId).pipe(map(response => {
      let result: BankAccount[] = [];
      response.forEach((r: BankAccount) => {
        r.bankInfo = (new Bank()).clone(r.bankInfo);
        result.push((new BankAccount()).clone(r));
      });
      return result;
    }));
  }

  @CastResponse(() => BankAccount)
  private _searchForBankAccount(accountNumber: number): Observable<BankAccount> {
    return this.http.get<any>(this.getBankAccountCtrlURLSegment() + '/account-number?accountNumber=' + accountNumber);
  }

  searchForBankAccount(accountNumber: number) {
    return this._searchForBankAccount(accountNumber).pipe(map(response => {
      response.bankInfo = (new Bank()).clone(response.bankInfo);
      response.bankCategoryInfo = (new Lookup()).clone(response.bankCategoryInfo);
      return response;
    }));
  }

  getNPOEmployeeCtrlURLSegment(): string {
    return this.urlService.URLS.NPO_EMPLOYEE;
  }

  @CastResponse(() => NpoEmployee)
  private _loadOrgNPOEmployees(): Observable<NpoEmployee[]> {
    return this.http.get<NpoEmployee[]>(this.getNPOEmployeeCtrlURLSegment() + '/composite');
  }

  // noinspection JSUnusedGlobalSymbols
  loadOrgNPOEmployees() {
    return this._loadOrgNPOEmployees().
    pipe(map(response => {
      let result: NpoEmployee[] = [];
      response.forEach((r: any) => {
        result.push((new NpoEmployee()).clone(r));
      });
      return result;
    }));
  }

  @CastResponse(() => NpoEmployee)
  private _searchNPOEmployees(qId: string): Observable<NpoEmployee[]> {
    return qId ? this.http.get<NpoEmployee[]>(this.getNPOEmployeeCtrlURLSegment() + '/criteria?q-id=' + qId) : this.http.get<any>(this.getNPOEmployeeCtrlURLSegment() + '/criteria');
  }

  searchNPOEmployees(qId: string) {
    return this._searchNPOEmployees(qId).
    pipe(map(response => {
      let result: NpoEmployee[] = [];
      response.forEach((r: any) => {
        result.push((new NpoEmployee()).clone(r));
      });
      return result;
    }));
  }

  openSelectEmployee(employees: NpoEmployee[]): DialogRef {
    return this.dialog.show(SelectEmployeePopupComponent, {
      employees
    });
  }

  approveTask(model: InternalBankAccountApproval, action: WFResponseType): DialogRef {
    return this.dialog.show(InternalBankApprovalApproveTaskPopupComponent, {
      model,
      action: action
    });
  }
}
