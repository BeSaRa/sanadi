import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi, withJsonpSupport } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { IAppConfig } from '@contracts/i-app-config';
import { ConfigurationService } from '@services/configuration.service';
import { UrlService } from '@services/url.service';
import { httpInterceptors } from './http-interceptors/http-interceptors';
import { LangService } from '@services/lang.service';
import './helpers/protoypes/custom-prototypes';
import { InfoService } from '@services/info.service';
import { ILoginInfo } from '@contracts/i-login-info';
import { LookupService } from '@services/lookup.service';
import { ExternalUserCustomRoleService } from '@services/external-user-custom-role.service';
import { ExternalUserService } from '@services/external-user.service';
import { AidLookupService } from '@services/aid-lookup.service';
import { GeneralErrorHandler } from './ganaeral-error-handler/general-error-handler';
import { CookieModule } from 'ngx-cookie';
import { TokenService } from '@services/token.service';
import { AuthService } from '@services/auth.service';
import { MenuItemService } from '@services/menu-item.service';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { AutoRegisterService } from '@services/auto-register.service';
import { InternalLoginComponent } from './pages/internal-login/internal-login.component';
import { ExternalLoginComponent } from './pages/external-login/external-login.component';
import { ReportService } from '@services/report.service';
import { ProfileService } from '@services/profile.service';
import { CustomMenuService } from '@services/custom-menu.service';
import { IConfig, NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask, provideNgxMask } from 'ngx-mask';
const maskConfig: Partial<IConfig> = {
  validation: false,
};
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    InternalLoginComponent,
    ExternalLoginComponent,
    
  ],
  exports: [NgxMaskDirective,NgxMaskPipe],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    CookieModule.withOptions(),
    SharedModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormlyModule.forRoot({ extras: { lazyRender: true } }),
    FormlyBootstrapModule,
    NgxMaskDirective,NgxMaskPipe
   
  ],
  providers: [
    { provide: ErrorHandler, useClass: GeneralErrorHandler },
    NgxMaskDirective,
    provideNgxMask(),
    {
      provide: APP_INITIALIZER,
      useFactory: AppModule.AppInit,
      multi: true,
      deps: [
        ConfigurationService,
        UrlService,
        LangService,
        InfoService,
        LookupService,
        TokenService,
        AuthService,
        AutoRegisterService,
        MenuItemService, // used in authService to load menus
        ReportService, // used in menuItemService to set reports menus
        CustomMenuService, // used in employeeService after load data and menuItemService to typecast to menuItems
        ExternalUserCustomRoleService,
        ExternalUserService,
        ProfileService,
        AidLookupService
      ]
    },
    httpInterceptors,
    provideHttpClient(withInterceptorsFromDi(), withJsonpSupport())
  ]
})
export class AppModule {
  static AppInit(configurationService: ConfigurationService,
    urlService: UrlService,
    langService: LangService,
    infoService: InfoService,
    lookupService: LookupService,
    tokenService: TokenService,
    authService: AuthService,
    autoRegister: AutoRegisterService): () => Promise<unknown> {
    autoRegister.ping();
    return () => {
      return forkJoin({
        configFile: configurationService.loadConfiguration(),
        urls: urlService.loadUrls(),
      })
        .toPromise().then((latest) => {
          let finalConfig: IAppConfig = configurationService.mergeConfigurations(latest!.configFile);
          configurationService.setConfigurations(finalConfig);
          urlService.prepareUrls(latest!.urls);
          langService.setLanguageChangeUrls();
          return infoService.load().toPromise().then((infoResult: ILoginInfo|undefined) => {
            infoService.setInfoData(infoResult!);
            langService.list = infoResult!.localizationSet;
            langService.readLanguageFromCookie();
            langService._loadDone$.next(langService.list);
            lookupService.setLookupsMap(infoResult!.lookupMap);
            return tokenService.setAuthService(authService)
              .validateToken().toPromise()
          });
        });
    };
  }
}
