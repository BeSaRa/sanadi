import {Injectable} from '@angular/core';
import {DialogService} from './dialog.service';
import {HttpErrorResponse, HttpRequest} from '@angular/common/http';
import {AdminResult} from '@models/admin-result';
import {Router} from '@angular/router';
import {EmployeeService} from '@services/employee.service';
import {FactoryService} from '@services/factory.service';
import {LangService} from '@services/lang.service';
import {AuthService} from '@services/auth.service';
import {UrlService} from '@services/url.service';

@Injectable({
  providedIn: 'root'
})
export class ExceptionHandlerService {
  private excludedUrls: Map<string, string> = new Map<string, string>();
  private excludedCodes: Map<number, number> = new Map<number, number>();
  private excludedMethodWithURL: Map<string, string> = new Map<string, string>();

  constructor(private dialog: DialogService,
              private router: Router) {
  }

  private _handle401(): void {
    const employeeService: EmployeeService = FactoryService.getService('EmployeeService');
    if (!employeeService.loggedIn()) {
      return;
    }
    const langService: LangService = FactoryService.getService('LangService');
    const authService: AuthService = FactoryService.getService('AuthService');
    authService.logout().subscribe(() => {
      this.dialog.error(langService.map.msg_session_timed_out);
      this.router.navigate([employeeService.isExternalUser() ? '/login-external' : '/login']).then();
    });
  }

  handle(error: any, req?: HttpRequest<any>): void {
    if (error.status === 401) {
      const urlService: UrlService = FactoryService.getService('UrlService');
      // if not login urls request, handle manually and don't proceed to general exception
      if (!urlService.loginUrlsList.includes(error.url)) {
        this._handle401();
        return;
      }
    }
    if (!error.error) {
      error.error = {eo: error.eo}
    }

    if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 200)) {
      this.dialog.error('CHECK SERVICE URL <br />' + error.message);
      return;
    }

    if (error instanceof HttpErrorResponse && req && this.excludedMethodWithURL.has(req?.method + req?.urlWithParams)) {
      return;
    }

    error.error.eo = AdminResult.createInstance(error.error.eo);
    // do not handle the exception came from this url
    if (this.excludedUrls.has(error.url!)) {
      return;
    }
    /*const modelInterceptor = error.hasOwnProperty('message') && (error.message.indexOf('JSON') !== -1);
    // for now we will log it to console but later we will agreed with backend-team about the errorHandler for each code.
    this.dialog.error(error.error.eo.getName() ? ((modelInterceptor ? 'CHECK YOU MODEL INTERCEPTOR' : error.error.ec) + '<br />' + error.error.eo.getName()) : (error.error.ec + '<br />' + error.error.ms));*/
    this.dialog.error(error.error.eo.getName() ? (error.error.eo.getName()) : (error.error.ms));
  }

  // noinspection JSUnusedGlobalSymbols
  excludeHandlingForURL(url: string): void {
    this.excludedUrls.set(url, url);
  }

  removeExcludeHandlingForURL(url: string): void {
    if (this.excludedUrls.has(url)) {
      this.excludedUrls.delete(url);
    }
  }

  excludeHandlingForMethodURL(method: string, url: string) {
    this.excludedMethodWithURL.set(method.toUpperCase() + url, url);
  }

  // noinspection JSUnusedGlobalSymbols
  excludeHandlingForCode(code: number): void {
    this.excludedCodes.set(code, code);
  }
}
