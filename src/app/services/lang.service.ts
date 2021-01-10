import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {Localization} from '../models/localization';
import {Generator} from '../decorators/generator';
import {Language} from '../models/language';
import {IAvailableLanguages} from '../interfaces/i-available-languages';
import {DOCUMENT} from '@angular/common';
import {Styles} from '../enums/styles.enum';
import {map, tap} from 'rxjs/operators';
import {ILanguageKeys} from '../interfaces/i-language-keys';

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

  constructor(@Inject(DOCUMENT) private document: Document, private http: HttpClient, private urlService: UrlService) {
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

  addLocal(local: Localization): Observable<Localization> {
    return this.http.post<Localization>(this.urlService.URLS.LANGUAGE, local);
  }

  updateLocal(local: Localization): Observable<any> {
    return this.http.put(this.urlService.URLS.LANGUAGE, local);
  }

  deleteLocal(local: Localization | number): Observable<any> {
    return this.http.delete(this.urlService.URLS.LANGUAGE);
  }
}
