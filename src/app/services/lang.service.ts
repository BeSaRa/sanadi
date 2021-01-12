import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Localization} from '../models/localization';
import {Generator} from '../decorators/generator';
import {Language} from '../models/language';
import {IAvailableLanguages} from '../interfaces/i-available-languages';
import {DOCUMENT} from '@angular/common';
import {Styles} from '../enums/styles.enum';
import {switchMap, tap} from 'rxjs/operators';
import {ILanguageKeys} from '../interfaces/i-language-keys';
import {DialogService} from './dialog.service';
import {FactoryService} from './factory.service';
import {LocalizationPopupComponent} from '../admin/popups/localization-popup/localization-popup.component';
import {DialogRef} from '../shared/models/dialog-ref';
import {InterceptParam, SendInterceptor} from '../decorators/model-interceptor';
import {interceptLocalization} from '../model-interceptors/localization-interceptor';
import {OperationTypes} from '../enums/operation-types.enum';

@Injectable({
  providedIn: 'root'
})
export class LangService {
  private languages: IAvailableLanguages = {
    en: new Language(1, 'English', 'en', 'ltr', Styles.BOOTSTRAP),
    ar: new Language(1, 'Arabic', 'ar', 'rtl', Styles.BOOTSTRAP_RTL)
  };
  private languageToggler: { [index: string]: string } = {
    ar: 'en',
    en: 'ar'
  };
  private languageChange: BehaviorSubject<Language> = new BehaviorSubject<Language>(this.languages.en);
  public onLanguageChange$: Observable<Language> = this.languageChange.asObservable();
  public localization: Localization[] = [];
  protected firstTime = true;
  public lang: ILanguageKeys = {} as ILanguageKeys;

  constructor(@Inject(DOCUMENT) private document: Document,
              private http: HttpClient,
              private dialog: DialogService,
              private urlService: UrlService) {
    FactoryService.registerService('LangService', this);
    this.changeLanguage(this.languageChange.value);
    this.firstTime = false;
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

  @Generator(Localization, true)
  private _loadLocalization(): Observable<Localization[]> {
    return this.http.get<Localization[]>(this.urlService.URLS.LANGUAGE);
  }

  private prepareCurrentLang(): ILanguageKeys {
    this.lang = this.localization.reduce<ILanguageKeys>((acc: ILanguageKeys, current: Localization) => {
      const key = current.localizationKey as keyof ILanguageKeys;
      const currentLang = this.languageChange.value.code + 'Name' as keyof Localization;
      return {...acc, [key]: current[currentLang]} as ILanguageKeys;
    }, {lang: this.languageChange.value.code} as ILanguageKeys);
    return this.lang;
  }


  loadLocalization(prepare: boolean = false): Observable<Localization[]> {
    return this._loadLocalization()
      .pipe(
        tap(result => this.localization = result),
        tap(_ => prepare ? this.prepareCurrentLang() : null)
      );
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

  @SendInterceptor(interceptLocalization)
  create(@InterceptParam() local: Localization): Observable<Localization> {
    return this.http.post<Localization>(this.urlService.URLS.LANGUAGE, local);
  }

  @SendInterceptor(interceptLocalization)
  update(@InterceptParam() local: Localization): Observable<any> {
    return this.http.put(this.urlService.URLS.LANGUAGE + '/' + local.id, local);
  }

  delete(localId: number): Observable<boolean> {
    return this.http.delete<boolean>(this.urlService.URLS.LANGUAGE + '/' + localId);
  }

  @Generator(Localization)
  getById(localId: number): Observable<Localization> {
    return this.http.get<Localization>(this.urlService.URLS.LANGUAGE + '/' + localId);
  }

  openUpdateDialog(localId: number): Observable<DialogRef> {
    return this.getById(localId).pipe(
      switchMap((localization: Localization) => {
        return of(this.dialog.show(LocalizationPopupComponent, {localization: localization, operation: OperationTypes.UPDATE}));
      })
    );
  }

  openCreateDialog(): DialogRef {
    return this.dialog.show(LocalizationPopupComponent, {localization: new Localization(), operation: OperationTypes.CREATE});
  }
}
