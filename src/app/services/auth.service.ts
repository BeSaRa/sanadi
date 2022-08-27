import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { ICredentials } from '@contracts/i-credentials';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { FactoryService } from './factory.service';
import { EmployeeService } from './employee.service';
import { ILoginData } from '@contracts/i-login-data';
import { TokenService } from './token.service';
import { InternalUserService } from "@app/services/internal-user.service";
import { CommonService } from "@services/common.service";
import { FollowupPermissionService } from "@services/followup-permission.service";
import { UserTypes } from "@app/enums/user-types.enum";
import { CastResponse } from "@decorators/cast-response";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticatedTrigger$: BehaviorSubject<ILoginData | null> = new BehaviorSubject<ILoginData | null>(null);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedTrigger$
    .asObservable()
    .pipe(map(value => !!value));

  constructor(private http: HttpClient,
              private urlService: UrlService,
              private tokenService: TokenService,
              private commonService: CommonService,
              private followupPermissionService: FollowupPermissionService,
              private internalUserService: InternalUserService,
              private employeeService: EmployeeService) {
    FactoryService.registerService('AuthService', this);
    this.init();
  }

  @CastResponse('')
  private _externalLogin(credentials: Partial<ICredentials>): Observable<ILoginData> {
    return this.http.post<ILoginData>(this.urlService.URLS.AUTHENTICATE, credentials);
  }


  @CastResponse('')
  private _internalLogin(credentials: Partial<ICredentials>): Observable<ILoginData> {
    return this.http.post<ILoginData>(this.urlService.URLS.INTERNAL_AUTHENTICATE, credentials);
  }

  @CastResponse('')
  private _validateToken(): Observable<ILoginData> {
    return this.http.post<ILoginData>(this.urlService.URLS.VALIDATE_TOKEN, {});
  }

  private externalLogin(credential: Partial<ICredentials>): Observable<ILoginData> {
    return this._externalLogin(credential).pipe(tap((result) => {
        this.isAuthenticatedTrigger$.next(result);
      }),
      catchError((error) => {
        this.isAuthenticatedTrigger$.next(null);
        return throwError(error);
      }),
    );
  }

  private internalLogin(credential: Partial<ICredentials>): Observable<ILoginData> {
    return this._internalLogin(credential).pipe(tap((result) => {
        this.isAuthenticatedTrigger$.next(result);
      }),
      catchError((error) => {
        this.isAuthenticatedTrigger$.next(null);
        return throwError(error);
      }),
    );
  }

  private _login(credential: Partial<ICredentials>, external: boolean): Observable<ILoginData> {
    return external ? this.externalLogin(credential) : this.internalLogin(credential);
  }

  login(credential: Partial<ICredentials>, external: boolean): Observable<ILoginData> {
    return this._login(credential, external).pipe(switchMap((loggedIn) => this.commonService.loadCounters().pipe(tap(counters => {
      if (loggedIn.type === UserTypes.INTERNAL) {
        counters.flags && counters.flags.externalFollowUpPermission && this.employeeService.addFollowupPermission('EXTERNAL_FOLLOWUP')
        counters.flags && counters.flags.internalFollowUpPermission && this.employeeService.addFollowupPermission('INTERNAL_FOLLOWUP')
      }
    })).pipe(map(_ => loggedIn))))
  }

  logout(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      this.isAuthenticatedTrigger$.next(null);
      subscriber.next(true);
      subscriber.complete();
    });
  }

  init(): void {
    this.isAuthenticated$
      .pipe(
        withLatestFrom(this.isAuthenticatedTrigger$),
        map(([isAuthenticated, loginData]) => {
          if (isAuthenticated && loginData) {
            this.employeeService.fillCurrentEmployeeData(loginData);
            this.tokenService.setToken(loginData.token);
            return loginData
          } else {
            this.employeeService.clear();
            this.tokenService.clearToken();
            return false
          }
        })
      )
      .subscribe();
  }

  validateToken(): Observable<ILoginData> {
    return this._validateToken().pipe(tap((result) => {
        this.isAuthenticatedTrigger$.next(result);
      }),
      catchError((error) => {
        this.isAuthenticatedTrigger$.next(null);
        return throwError(error);
      })
    );
  }

}
