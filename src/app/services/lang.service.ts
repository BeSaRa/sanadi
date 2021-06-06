import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {Localization} from '../models/localization';
import {Language} from '../models/language';
import {IAvailableLanguages} from '../interfaces/i-available-languages';
import {DOCUMENT} from '@angular/common';
import {Styles} from '../enums/styles.enum';
import {map, switchMap} from 'rxjs/operators';
import {ILanguageKeys} from '../interfaces/i-language-keys';
import {DialogService} from './dialog.service';
import {FactoryService} from './factory.service';
import {LocalizationPopupComponent} from '../shared/popups/localization-popup/localization-popup.component';
import {DialogRef} from '../shared/models/dialog-ref';
import {LocalizationInterceptor} from '../model-interceptors/localization-interceptor';
import {OperationTypes} from '../enums/operation-types.enum';
import {IDialogData} from '../interfaces/i-dialog-data';
import {LangType, LocalizationMap} from '../types/types';
import {BackendGenericService} from '../generics/backend-generic-service';
import {ECookieService} from './e-cookie.service';
import {ConfigurationService} from './configuration.service';
import {EmployeeService} from './employee.service';
import {AuthService} from './auth.service';
import {Generator} from '../decorators/generator';
import {ILoginData} from '../interfaces/i-login-data';
import {IDefaultResponse} from '../interfaces/idefault-response';


@Injectable({
  providedIn: 'root'
})
export class LangService extends BackendGenericService<Localization> {
  list: Localization[] = [];
  private languages: IAvailableLanguages = {
    en: new Language(1, 'English', 'en', 'ltr', Styles.BOOTSTRAP, 'العربية'),
    ar: new Language(2, 'العربية', 'ar', 'rtl', Styles.BOOTSTRAP_RTL, 'English')
  };
  private languageToggler: { [index: string]: string } = {
    ar: 'en',
    en: 'ar'
  };
  private languageChange: BehaviorSubject<Language> = new BehaviorSubject<Language>(this.languages.ar);
  public onLanguageChange$: Observable<Language> = this.languageChange.asObservable();
  protected firstTime = true;
  public map: LangType = {} as LangType;
  private localizationMap: LocalizationMap = {} as LocalizationMap;
  private linkElement!: HTMLLinkElement;
  printingLanguage: { [index: string]: number } = {
    ar: 1,
    en: 2
  };

  constructor(@Inject(DOCUMENT) private document: Document,
              public http: HttpClient,
              private dialogService: DialogService,
              private eCookieService: ECookieService,
              private configurationService: ConfigurationService,
              private employeeService: EmployeeService,
              private authService: AuthService,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('LangService', this);
    this.getLinkElement();
    this.changeLanguage(this.languageChange.value);
    this.firstTime = false;

    this._loadDone$.subscribe(() => {
      this.prepareCurrentLang();
      this.prepareLocalizationMap();
    });
  }


  private getLinkElement(): void {
    this.linkElement = this.document.getElementById('main-style') as HTMLLinkElement;
  }

  /**
   * @description change the HTML element Direction
   * @param direction
   * @private
   */
  private changeHTMLDirection(direction: string): void {
    const html = this.document.querySelector('html') as HTMLHtmlElement;
    html.dir = direction;
  }

  /**
   * @description change href for bootstrap style.
   * @param style
   * @private
   */
  private changeStyleHref(style: Styles): void {
    this.linkElement.href = 'assets/style/' + style;
  }

  private prepareCurrentLang(): ILanguageKeys {
    this.map = this.list.reduce<Record<keyof ILanguageKeys, string>>((acc: ILanguageKeys, current: Localization) => {
      const key = current.localizationKey as keyof ILanguageKeys;
      const currentLang = this.languageChange.value.code + 'Name' as keyof Localization;
      return {...acc, [key]: current[currentLang]} as ILanguageKeys;
    }, {lang: this.languageChange.value.code} as Record<keyof ILanguageKeys, string>);
    return this.map;
  }


  prepareLocalizationMap(): void {
    this.localizationMap = this.list.reduce<LocalizationMap>((acc, current) => {
      const localKey = current.localizationKey as keyof ILanguageKeys;
      return {...acc, [localKey]: current};
    }, {} as LocalizationMap);
  }

  /**
   * @description change current language for application
   * @param language
   * @param silent
   */
  changeLanguage(language: Language, silent: boolean = false): void {
    this.changeHTMLDirection(language.direction);
    this.changeStyleHref(language.style);
    if (!silent) {
      this.languageChange.next(language);
    }

    this.eCookieService.putEObject(this.configurationService.CONFIG.LANGUAGE_STORE_KEY, language);
    this.prepareCurrentLang();
  }

  /**
   * @description toggle the current language for the application [ar| en]
   */
  toggleLanguage(): Observable<Language> {
    return new Observable((subscriber) => {
      const code = this.languageToggler[this.languageChange.value.code];
      const lang = this.languages[code];
      let sub: Subscription;
      if (this.employeeService.loggedIn()) {
        sub = this._changeUserLanguage(code)
          .subscribe((result) => {
            this.authService.isAuthenticatedTrigger$.next(result);
            this.changeLanguage(lang);
            subscriber.next(lang);
            subscriber.complete();
          });
      } else {
        this.changeLanguage(lang);
        subscriber.next(lang);
        subscriber.complete();
      }
      return () => {
        sub ? sub.unsubscribe() : null;
      };
    });
  }

  @Generator(undefined, false, {property: 'rs'})
  private _changeUserLanguage(code: string): Observable<ILoginData> {
    return this.http.post<ILoginData>(this.urlService.URLS.AUTHENTICATE.replace('/nas/login', '') + '/lang/' + (code).toUpperCase(), undefined);
  }

  changeLanguageByCode(code: string): void {
    this.changeLanguage(this.languages[code]);
  }

  readLanguageFromCookie(): void {
    const lang = this.eCookieService.getEObject(this.configurationService.CONFIG.LANGUAGE_STORE_KEY) as Language;
    if (lang) {
      this.changeLanguage(lang);
    }
  }

  getLocalByKey(key: keyof ILanguageKeys): Localization {
    return this.localizationMap[key] || {};
  }

  private getLocalForSpecificLang(key: keyof ILanguageKeys, lang: 'ar' | 'en'): string {
    const langKey = lang + 'Name' as keyof { arName: string, enName: string };
    return this.getLocalByKey(key)[langKey] || key;
  }

  getArabicLocalByKey(key: keyof ILanguageKeys): string {
    return this.getLocalForSpecificLang(key, 'ar');
  }

  getEnglishLocalByKey(key: keyof ILanguageKeys): string {
    return this.getLocalForSpecificLang(key, 'en');
  }

  openUpdateDialog(modelId: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((localization: Localization) => {
        return of(this.dialogService.show<IDialogData<Localization>>(LocalizationPopupComponent, {
          model: localization,
          operation: OperationTypes.UPDATE
        }));
      })
    );
  }

  openCreateDialog(): DialogRef {
    return this.dialogService.show<IDialogData<Localization>>(LocalizationPopupComponent, {
      model: new Localization(),
      operation: OperationTypes.CREATE
    });
  }

  getCurrentLanguage(): Language {
    return this.languages[this.map.lang];
  }

  getPrintingLanguage(): number {
    return this.printingLanguage[this.map.lang];
  }

  _getModel(): any {
    return Localization;
  }

  _getSendInterceptor(): any {
    return LocalizationInterceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.LANGUAGE;
  }

  _getReceiveInterceptor(): any {
  }

  getLocalizationByKey(key: string): Observable<boolean> {
    return this.http
      .get<IDefaultResponse<boolean>>(this.urlService.URLS.LANGUAGE + '/exists/' + key)
      .pipe(map(response => {
        return response.rs;
      }));
  }
}
