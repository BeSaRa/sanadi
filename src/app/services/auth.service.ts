import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, map, tap, withLatestFrom} from 'rxjs/operators';
import {ICredentials} from '../interfaces/i-credentials';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {Generator} from '../decorators/generator';
import {FactoryService} from './factory.service';
import {EmployeeService} from './employee.service';
import {ILoginData} from '../interfaces/i-login-data';
import {TokenService} from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedTrigger$: BehaviorSubject<ILoginData | null> = new BehaviorSubject<ILoginData | null>(null);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedTrigger$
    .asObservable()
    .pipe(map(value => !!value));

  constructor(private http: HttpClient,
              private urlService: UrlService,
              private tokenService: TokenService,
              private employeeService: EmployeeService) {
    FactoryService.registerService('AuthService', this);
    this.init();
  }

  @Generator(undefined, false, {property: 'rs'})
  private _externalLogin(credentials: Partial<ICredentials>): Observable<ILoginData> {
    return this.http.post<ILoginData>(this.urlService.URLS.AUTHENTICATE, credentials);
  }


  @Generator(undefined, false, {property: 'rs'})
  private _internalLogin(credentials: Partial<ICredentials>): Observable<ILoginData> {
    return this.http.post<ILoginData>(this.urlService.URLS.INTERNAL_AUTHENTICATE, credentials);
  }

  @Generator(undefined, false, {property: 'rs'})
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

  login(credential: Partial<ICredentials>, external: boolean): Observable<ILoginData> {
    return external ? this.externalLogin(credential) : this.internalLogin(credential);
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
          } else {
            this.employeeService.clear();
            this.tokenService.clearToken();
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
      }),
    );
  }

}
