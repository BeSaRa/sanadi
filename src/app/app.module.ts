import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './pages/login/login.component';
import {HomeComponent} from './pages/home/home.component';
import {SharedModule} from './shared/shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {forkJoin, Observable} from 'rxjs';
import {IAppConfig} from './interfaces/i-app-config';
import {ConfigurationService} from './services/configuration.service';
import {UrlService} from './services/url.service';
import {IAppUrls} from './interfaces/i-app-urls';
import {httpInterceptors} from './http-interceptors/http-interceptors';
import {LangService} from './services/lang.service';
import './helpers/protoypes/string-prototypes';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: AppModule.AppInit,
      multi: true,
      deps: [HttpClient, ConfigurationService, UrlService, LangService]
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
                 lang: LangService): () => Promise<unknown> {
    AppModule.http = http;
    return () => {
      return forkJoin({
        urls: AppModule.loadResource<IAppUrls>(AppModule.URLS_FILE),
        config: AppModule.loadResource<IAppConfig>(AppModule.CONFIG_FILE),
      })
        .toPromise().then((latest) => {
          configurationService.setConfigurations(latest.config);
          urlService.prepareUrls(latest.urls);
          return lang.load(true).toPromise();
        });
    };
  }

  static loadResource<T>(fileName: string): Observable<T> {
    return AppModule.http.get<T>(fileName);
  }
}
