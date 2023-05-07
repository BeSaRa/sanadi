import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {DialogService} from '@services/dialog.service';
import {LangService} from '@services/lang.service';
import {EncryptionService} from '@services/encryption.service';
import {ConfigurationService} from '@services/configuration.service';
import {INavigatedItem} from '@contracts/inavigated-item';
import {tap} from 'rxjs/operators';
import {CaseTypes} from '@app/enums/case-types.enum';
import {UrgentInterventionAnnouncementService} from '@services/urgent-intervention-announcement.service';
import {ILanguageKeys} from '@contracts/i-language-keys';

@Injectable({
  providedIn: 'root'
})
export class PreValidateDataOldGuard implements CanActivate {
  itemKey!: string;
  caseType!: CaseTypes;
  route!: ActivatedRouteSnapshot;
  failMsgKey!: keyof ILanguageKeys;

  constructor(private dialogService: DialogService,
              private langService: LangService,
              private router: Router,
              private encrypt: EncryptionService,
              private configService: ConfigurationService,
              private urgentInterventionAnnouncementService: UrgentInterventionAnnouncementService) {
    this.itemKey = configService.CONFIG.E_SERVICE_ITEM_KEY;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.route = route;
    this.caseType = route.data.caseType;
    this.failMsgKey = route.data.preValidateFailMsgKey || 'access_denied';

    return this.preValidateData()
      .pipe(tap(canProceed => !canProceed ? this._displayMessage() : true));
  }

  // to check if there is item param
  hasItemParam(): boolean {
    return this.route.queryParamMap.has(this.itemKey);
  }

  getItem(): string | null {
    return this.route.queryParamMap.get(this.itemKey);
  }

  validItem(): boolean {
    try {
      this.encrypt.decrypt<INavigatedItem>(this.getItem()!);
      return true;
    } catch (e) {
      return false;
    }
  }

  preValidateData(): Observable<boolean> {
    if (this.caseType === CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT) {
      let isAddOperation = !this.hasItemParam() || !this.validItem();
      return this.urgentInterventionAnnouncementService.preValidateAddLicense(isAddOperation);
    }
    return of(true);
  }

  private _displayMessage() {
    this.dialogService.info(this.langService.map[this.failMsgKey])
      /*.onAfterClose$.subscribe(() => {
        this.router.navigate(['/home']).then();
      });*/
  }
}
