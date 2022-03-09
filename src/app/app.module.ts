import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, ErrorHandler, NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from './pages/home/home.component';
import {SharedModule} from './shared/shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClient, HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import {forkJoin, Observable} from 'rxjs';
import {IAppConfig} from './interfaces/i-app-config';
import {ConfigurationService} from './services/configuration.service';
import {UrlService} from './services/url.service';
import {IAppUrls} from './interfaces/i-app-urls';
import {httpInterceptors} from './http-interceptors/http-interceptors';
import {LangService} from './services/lang.service';
import './helpers/protoypes/custom-prototypes';
import {InfoService} from './services/info.service';
import {ILoginInfo} from './interfaces/i-login-info';
import {LookupService} from './services/lookup.service';
import {CustomRoleService} from './services/custom-role.service';
import {OrganizationBranchService} from './services/organization-branch.service';
import {OrganizationUserService} from './services/organization-user.service';
import {AidLookupService} from './services/aid-lookup.service';
import {OrganizationUnitService} from './services/organization-unit.service';
import {GeneralErrorHandler} from './ganaeral-error-handler/general-error-handler';
import {CookieModule} from 'ngx-cookie';
import {TokenService} from './services/token.service';
import {AuthService} from './services/auth.service';
import {MenuItemService} from './services/menu-item.service';
import {ReactiveFormsModule} from '@angular/forms';
import {FormlyModule} from '@ngx-formly/core';
import {FormlyBootstrapModule} from '@ngx-formly/bootstrap';
import {AutoRegisterService} from './services/auto-register.service';
import {InternalLoginComponent} from './pages/internal-login/internal-login.component';
import {ExternalLoginComponent} from './pages/external-login/external-login.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    InternalLoginComponent,
    ExternalLoginComponent
  ],
  imports: [
    BrowserModule,
    CookieModule.forRoot(),
    SharedModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    ReactiveFormsModule,
    FormlyModule.forRoot({extras: {lazyRender: true}}),
    FormlyBootstrapModule
  ],
  providers: [
    {provide: ErrorHandler, useClass: GeneralErrorHandler},
    {
      provide: APP_INITIALIZER,
      useFactory: AppModule.AppInit,
      multi: true,
      deps: [
        HttpClient,
        ConfigurationService,
        UrlService,
        LangService,
        InfoService,
        LookupService,
        TokenService,
        AuthService,
        MenuItemService,
        AutoRegisterService,
        CustomRoleService,
        OrganizationBranchService,
        OrganizationUserService,
        AidLookupService,
        OrganizationUnitService]
    },
    httpInterceptors
  ],
  exports: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  static CONFIG_FILE = 'CONFIGURATION.json';
  static URLS_FILE = 'URLS.json';
  static http: HttpClient;

  static AppInit(http: HttpClient,
                 configurationService: ConfigurationService,
                 urlService: UrlService,
                 langService: LangService,
                 infoService: InfoService,
                 lookupService: LookupService,
                 tokenService: TokenService,
                 authService: AuthService,
                 menuItemService: MenuItemService,
                 autoRegister: AutoRegisterService): () => Promise<unknown> {
    AppModule.http = http;
    autoRegister.ping();
    return () => {
      return forkJoin({
        urls: AppModule.loadResource<IAppUrls>(AppModule.URLS_FILE),
        config: AppModule.loadResource<IAppConfig>(AppModule.CONFIG_FILE)
      })
        .toPromise().then((latest) => {
          configurationService.setConfigurations(latest.config);
          urlService.prepareUrls(latest.urls);
          return infoService.load().toPromise().then((infoResult: ILoginInfo) => {
            langService.list = infoResult.localizationSet;
            langService.readLanguageFromCookie();
            langService._loadDone$.next(langService.list);
            lookupService.setLookupsMap(infoResult.lookupMap);
            return tokenService.setAuthService(authService)
              .validateToken().toPromise().then(() => {
                return menuItemService.load().toPromise();
              });
          });
        });
    };
  }

  static loadResource<T>(fileName: string): Observable<T> {
    return AppModule.http.get<T>(fileName);
  }
}
