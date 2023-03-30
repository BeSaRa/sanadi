import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {BehaviorSubject, Observable, of, Subject, Subscription} from 'rxjs';
import {Localization} from '@models/localization';
import {Language} from '@models/language';
import {IAvailableLanguages} from '@contracts/i-available-languages';
import {DOCUMENT} from '@angular/common';
import {Styles} from '@enums/styles.enum';
import {delay, exhaustMap, map, tap} from 'rxjs/operators';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {DialogService} from './dialog.service';
import {FactoryService} from './factory.service';
import {LocalizationPopupComponent} from '../shared/popups/localization-popup/localization-popup.component';
import {DialogRef} from '../shared/models/dialog-ref';
import {OperationTypes} from '@enums/operation-types.enum';
import {IDialogData} from '@contracts/i-dialog-data';
import {LangType, LocalizationMap} from '../types/types';
import {ECookieService} from './e-cookie.service';
import {ConfigurationService} from './configuration.service';
import {EmployeeService} from './employee.service';
import {AuthService} from './auth.service';
import {ILoginData} from '@contracts/i-login-data';
import {IDefaultResponse} from '@contracts/idefault-response';
import {UserTypes} from "@app/enums/user-types.enum";
import {CommonService} from "@services/common.service";
import {CastResponse, CastResponseContainer} from "@decorators/cast-response";
import {Pagination} from '@app/models/pagination';
import {PermissionsEnum} from '@app/enums/permissions-enum';
import {Title} from '@angular/platform-browser';
import {GlobalSettingsService} from '@services/global-settings.service';
import {CrudWithDialogGenericService} from '@app/generics/crud-with-dialog-generic-service';
import {ComponentType} from '@angular/cdk/portal';

@CastResponseContainer({
  $default: {
    model: () => Localization
  },
  $pagination: {
    model: () => Pagination,
    shape: {'rs.*': () => Localization}
  }
})
@Injectable({
  providedIn: 'root'
})
export class LangService extends CrudWithDialogGenericService<Localization> {
  list: Localization[] = [];
  private languages: IAvailableLanguages = {
    en: new Language(2, 'English', 'en', 'ltr', Styles.BOOTSTRAP, 'العربية'),
    ar: new Language(1, 'العربية', 'ar', 'rtl', Styles.BOOTSTRAP_RTL, 'English')
  };
  private languageSwitcher: { [index: string]: string } = {
    ar: 'en',
    en: 'ar'
  };
  private languageChange: BehaviorSubject<Language> = new BehaviorSubject<Language>(this.languages.ar);
  public onLanguageChange$: Observable<Language> = this.languageChange.asObservable().pipe(delay(0));
  protected firstTime = true;
  public map: LangType = {} as LangType;
  private localizationMap: LocalizationMap = {} as LocalizationMap;
  private linkElement!: HTMLLinkElement;
  printingLanguage: { [index: string]: number } = {
    ar: 1,
    en: 2
  };

  private changeStatusTrigger: Subject<{ language: Language, silent: boolean }> = new Subject<{ language: Language, silent: boolean }>();
  changeStatus$: Subject<'Start' | 'InProgress' | 'Done'> = new Subject<"Start" | "InProgress" | "Done">()

  constructor(@Inject(DOCUMENT) private document: Document,
              public http: HttpClient,
              public dialog: DialogService,
              private eCookieService: ECookieService,
              private configurationService: ConfigurationService,
              private employeeService: EmployeeService,
              private authService: AuthService,
              private commonService: CommonService,
              private urlService: UrlService,
              private titleService: Title) {
    super();
    FactoryService.registerService('LangService', this);
    this.getLinkElement();
    this.changeLanguage(this.languageChange.value);
    this.firstTime = false;

    this._loadDone$.subscribe(() => {
      this.prepareCurrentLang();
      this.prepareLocalizationMap();
    });
    this.listenToChangeTrigger();
  }

  _getDialogComponent(): ComponentType<any> {
    return LocalizationPopupComponent;
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
    this.changeStatusTrigger.next({
      language,
      silent
    })
  }

  private listenToChangeTrigger(): void {
    this.changeStatusTrigger
      .pipe(tap(_ => this.changeStatus$.next("Start")))
      .pipe(delay(300))
      .pipe(tap(_ => this.changeStatus$.next("InProgress")))
      .pipe(exhaustMap(({language, silent}) => {
        this.changeHTMLDirection(language.direction);
        this.changeStyleHref(language.style);
        this.eCookieService.putEObject(this.configurationService.CONFIG.LANGUAGE_STORE_KEY, language);
        if (!silent) {
          this.languageChange.next(language);
        }
        this.prepareCurrentLang();
        this.changeTitle();
        return of(true)
      }))
      .pipe(delay(300))
      .subscribe(() => {
        this.changeStatus$.next("Done")
      })
  }

  /**
   * @description toggle the current language for the application [ar| en]
   */
  toggleLanguage(): Observable<Language> {
    return new Observable((subscriber) => {
      const code = this.languageSwitcher[this.languageChange.value.code];
      const lang = this.languages[code];
      let sub: Subscription;
      if (this.employeeService.loggedIn()) {
        this.changeStatus$.next('Start');
        sub = this._changeUserLanguage(code)
          .subscribe((result) => {
            this.authService.isAuthenticatedTrigger$.next(result);
            if (result.type === UserTypes.INTERNAL) {
              this.commonService.flags?.externalFollowUpPermission && this.employeeService.addFollowupPermission(PermissionsEnum.EXTERNAL_FOLLOWUP)
              this.commonService.flags?.internalFollowUpPermission && this.employeeService.addFollowupPermission(PermissionsEnum.INTERNAL_FOLLOWUP)
            }
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

  @CastResponse('')
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
    return this.localizationMap[key] || (new Localization()).clone({
      arName: `(${key}) key not exist`,
      enName: `(${key}) key not exist`
    });
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

  addDialog(): DialogRef {
    return this.dialog.show<IDialogData<Localization>>(LocalizationPopupComponent, {
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

  _getServiceURL(): string {
    return this.urlService.URLS.LANGUAGE;
  }

  getLocalizationByKey(key: string): Observable<boolean> {
    return this.http
      .get<IDefaultResponse<boolean>>(this.urlService.URLS.LANGUAGE + '/exists/' + key)
      .pipe(map(response => {
        return response.rs;
      }));
  }

  changeTitle() {
    const globalSettingsService = FactoryService.getService<GlobalSettingsService>('GlobalSettingsService');
    this.titleService.setTitle(globalSettingsService.getGlobalSettings().getApplicationName());
  }
}
