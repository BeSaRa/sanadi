import { Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';
import { FactoryService } from './factory.service';
import { ECookieService } from './e-cookie.service';
import { AuthService } from './auth.service';
import { Observable, Subscription } from 'rxjs';
import { switchMap, tap } from "rxjs/operators";
import { CommonService } from "@services/common.service";
import { UserTypes } from "@app/enums/user-types.enum";
import { EmployeeService } from "@services/employee.service";
import {PermissionsEnum} from '@app/enums/permissions-enum';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private _token: string = '';
  private _excludedTokenUrls: string[] = [];
  private authService!: AuthService;

  constructor(private configurationService: ConfigurationService,
              private commonService: CommonService,
              private employeeService: EmployeeService,
              private eCookieService: ECookieService) {
    FactoryService.registerService('TokenService', this);
  }

  setToken(token: string): void {
    this._token = token;
    this.eCookieService.putE(this.configurationService.CONFIG.TOKEN_STORE_KEY, token);
  }

  clearToken(): void {
    this._token = '';
    this.eCookieService.removeE(this.configurationService.CONFIG.TOKEN_STORE_KEY);
  }

  getToken(): string {
    return this._token;
  }

  hasToken(): boolean {
    return !!this.getToken().length;
  }

  isExcludedUrl(url: string): boolean {
    return this._excludedTokenUrls.indexOf(url) !== -1;
  }

  addExcludedUrl(url: string): void {
    this._excludedTokenUrls = [...new Set(this._excludedTokenUrls.concat(url))];
  }

  getTokenFromStore(): string | undefined {
    return this.eCookieService.getE(this.configurationService.CONFIG.TOKEN_STORE_KEY);
  }

  setAuthService(authService: AuthService): TokenService {
    this.authService = authService;
    return this;
  }

  validateToken(): Observable<any> {
    return new Observable((subscriber) => {
      let innerSub: Subscription | undefined;
      if (!this.getTokenFromStore()) {
        subscriber.next(false);
        subscriber.complete();
      } else {
        this.setToken(this.getTokenFromStore()!);
        innerSub = this.authService.validateToken()
          .pipe(switchMap((loggedIn) => this.commonService.loadCounters().pipe(tap(counters => {
            if (loggedIn.type === UserTypes.INTERNAL) {
              counters.flags && counters.flags.externalFollowUpPermission && this.employeeService.addFollowupPermission(PermissionsEnum.EXTERNAL_FOLLOWUP)
              counters.flags && counters.flags.internalFollowUpPermission && this.employeeService.addFollowupPermission(PermissionsEnum.INTERNAL_FOLLOWUP)
            }
          }))))
          .subscribe(() => {
            subscriber.next(true);
            subscriber.complete();
          }, () => {
            subscriber.next(false);
            subscriber.complete();
          });
      }
      return () => {
        innerSub?.unsubscribe();
        innerSub = undefined;
      };
    });

  }

}
