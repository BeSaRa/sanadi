import {ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot} from "@angular/router";
import {INavigatedItem} from "@contracts/inavigated-item";
import {Observable, of} from "rxjs";
import {CaseTypes} from "@enums/case-types.enum";
import {inject} from "@angular/core";
import {DialogService} from "@services/dialog.service";
import {LangService} from "@services/lang.service";
import {EncryptionService} from "@services/encryption.service";
import {ConfigurationService} from "@services/configuration.service";
import {UrgentInterventionAnnouncementService} from "@services/urgent-intervention-announcement.service";
import {tap} from "rxjs/operators";
import {ILanguageKeys} from "@contracts/i-language-keys";

export class PreValidateDataGuard {

  private static data: {
    itemKey: string,
    caseType: CaseTypes,
    failMsgKey: keyof ILanguageKeys,
    route: ActivatedRouteSnapshot,
    dialogService: DialogService,
    langService: LangService,
    encryptionService: EncryptionService,
    configurationService: ConfigurationService,
    urgentInterventionAnnouncementService: UrgentInterventionAnnouncementService,
  } = {} as any;

  static canActivate: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    this._init(route);
    return this.preValidateData()
      .pipe(tap(canProceed => !canProceed ? this._displayFailMessage() : true));
  }

  private static _init(route: ActivatedRouteSnapshot): void {
    this.data.dialogService = inject(DialogService);
    this.data.langService = inject(LangService);
    this.data.encryptionService = inject(EncryptionService);
    this.data.configurationService = inject(ConfigurationService);
    this.data.urgentInterventionAnnouncementService = inject(UrgentInterventionAnnouncementService);

    this.data.itemKey = this.data.configurationService.CONFIG.E_SERVICE_ITEM_KEY;
    this.data.route = route;
    this.data.caseType = route.data.caseType;
    this.data.failMsgKey = route.data.preValidateFailMsgKey || 'access_denied';
  }

  // to check if there is item param
  private static hasItemParam(): boolean {
    return this.data.route.queryParamMap.has(this.data.itemKey);
  }

  private static getItem(): string | null {
    return this.data.route.queryParamMap.get(this.data.itemKey);
  }

  private static validItem(): boolean {
    try {
      this.data.encryptionService.decrypt<INavigatedItem>(this.getItem()!);
      return true;
    } catch (e) {
      return false;
    }
  }

  private static preValidateData(): Observable<boolean> {
    if (this.data.caseType === CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT) {
      let isAddOperation = !this.hasItemParam() || !this.validItem();
      return this.data.urgentInterventionAnnouncementService.preValidateAddLicense(isAddOperation);
    }
    return of(true);
  }

  private static _displayFailMessage() {
    // @ts-ignore
    this.data.dialogService.info(this.data.langService.map[this.data.failMsgKey]);
  }
}
