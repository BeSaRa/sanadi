import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Localization} from '../models/localization';
import {Language} from '../models/language';
import {IAvailableLanguages} from '../interfaces/i-available-languages';
import {DOCUMENT} from '@angular/common';
import {Styles} from '../enums/styles.enum';
import {switchMap} from 'rxjs/operators';
import {ILanguageKeys} from '../interfaces/i-language-keys';
import {DialogService} from './dialog.service';
import {FactoryService} from './factory.service';
import {LocalizationPopupComponent} from '../shared/popups/localization-popup/localization-popup.component';
import {DialogRef} from '../shared/models/dialog-ref';
import {interceptLocalization} from '../model-interceptors/localization-interceptor';
import {OperationTypes} from '../enums/operation-types.enum';
import {IDialogData} from '../interfaces/i-dialog-data';
import {LangType, LocalizationMap} from '../types/types';
import {BackendGenericService} from '../generics/backend-generic-service';


@Injectable({
  providedIn: 'root'
})
export class LangService extends BackendGenericService<Localization> {
  list: Localization[] = [];
  private languages: IAvailableLanguages = {
    en: new Language(1, 'English', 'en', 'ltr', Styles.BOOTSTRAP, 'العربية'),
    ar: new Language(1, 'العربية', 'ar', 'rtl', Styles.BOOTSTRAP_RTL, 'English')
  };
  private languageToggler: { [index: string]: string } = {
    ar: 'en',
    en: 'ar'
  };
  private languageChange: BehaviorSubject<Language> = new BehaviorSubject<Language>(this.languages.en);
  public onLanguageChange$: Observable<Language> = this.languageChange.asObservable();
  protected firstTime = true;
  public map: LangType = {} as LangType;
  private localizationMap: LocalizationMap = {} as LocalizationMap;

  constructor(@Inject(DOCUMENT) private document: Document,
              public http: HttpClient,
              private dialogService: DialogService,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('LangService', this);
    this.changeLanguage(this.languageChange.value);
    this.firstTime = false;

    this._loadDone$.subscribe(() => {
      this.prepareCurrentLang();
      this.prepareLocalizationMap();
    });
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
    (this.document.querySelector(`link[href^="bootstrap"]`) as HTMLLinkElement).href = style;
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
    this.prepareCurrentLang();
  }

  /**
   * @description toggle the current language for the application [ar| en]
   */
  toggleLanguage(): void {
    const code = this.languageToggler[this.languageChange.value.code];
    this.changeLanguage(this.languages[code]);
  }

  private getLocalByKey(key: keyof ILanguageKeys): Localization {
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

  _getModel(): any {
    return Localization;
  }

  _getSendInterceptor(): any {
    return interceptLocalization;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.LANGUAGE;
  }

  _getReceiveInterceptor(): any {
  }
}
