import {HttpClient} from '@angular/common/http';
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
import {Generator} from '@app/decorators/generator';
import {Observable} from 'rxjs';
import {Bank} from '@app/models/bank';
import {BankAccount} from '@app/models/bank-account';
import {map} from 'rxjs/operators';
import {NpoEmployee} from '@app/models/npo-employee';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {
  InternalBankApprovalApproveTaskPopupComponent
} from '@app/projects/popups/internal-bank-approval-approve-task-popup/internal-bank-approval-approve-task-popup.component';
import {BankService} from '@services/bank.service';

@Injectable({
  providedIn: 'root'
})
export class InternalBankAccountApprovalService extends EServiceGenericService<InternalBankAccountApproval> {
  jsonSearchFile: string = 'internal_bank_account_approval_search.json';
  interceptor: IModelInterceptor<InternalBankAccountApproval> = new InternalBankAccountApprovalInterceptor();
  serviceKey: keyof ILanguageKeys = 'menu_internal_bank_account_approval';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = ['fullSerial', 'subject', 'caseStatus', 'ouInfo', 'creatorInfo', 'createdOn'];

  constructor(public http: HttpClient,
              public dialog: DialogService,
              public domSanitizer: DomSanitizer,
              public cfr: ComponentFactoryResolver,
              public dynamicService: DynamicOptionsService,
              public urlService: UrlService,
              private bankService: BankService) {
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

  getBankCtrlURLSegment(): string {
    return this.urlService.URLS.BANK;
  }

  @Generator(Bank, true, {property: 'rs'})
  private _loadBanks(): Observable<Bank[]> {
    return this.http.get<any>(this.getBankCtrlURLSegment() + '/composite');
  }

  loadBanks() {
    return this._loadBanks().pipe(map(response => {
      let result: Bank[] = [];
      response.forEach((r: any) => {
        result.push((new Bank()).clone(r));
      });
      console.log('banks', result);
      return result;
    }));
  }

  getBankAccountCtrlURLSegment(): string {
    return this.urlService.URLS.BANK_ACCOUNT;
  }

  @Generator(BankAccount, true, {property: 'rs'})
  private _loadBankAccounts(): Observable<BankAccount[]> {
    return this.http.get<any>(this.getBankAccountCtrlURLSegment() + '/composite');
  }

  loadBankAccounts() {
    return this._loadBankAccounts().pipe(map(response => {
      let result: BankAccount[] = [];
      response.forEach((r: BankAccount) => {
        r.bankInfo = (new Bank()).clone(r.bankInfo);
        result.push((new BankAccount()).clone(r));
      });
      console.log('bankAccounts', result);
      return result;
    }));
  }

  getNPOEmployeeCtrlURLSegment(): string {
    return this.urlService.URLS.NPO_EMPLOYEE;
  }

  @Generator(NpoEmployee, true, {property: 'rs'})
  private _loadOrgNPOEmployees(): Observable<NpoEmployee[]> {
    return this.http.get<any>(this.getNPOEmployeeCtrlURLSegment() + '/composite');
  }

  loadOrgNPOEmployees() {
    return this._loadOrgNPOEmployees().
    pipe(map(response => {
      let result: NpoEmployee[] = [];
      response.forEach((r: any) => {
        result.push((new NpoEmployee()).clone(r));
      });
      console.log('NPOs', result);
      return result;
    }));
  }

  approveTask(model: InternalBankAccountApproval, action: WFResponseType): DialogRef {
    return this.dialog.show(InternalBankApprovalApproveTaskPopupComponent, {
      model,
      action: action
    });
  }
}
