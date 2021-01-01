import {AfterViewInit, Component, HostListener} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'sanadi';
  availableLanguages = ['ar', 'en'];
  directions = ['rtl', 'ltr'];

  private static setLanguage(lang: string): void {
    lang === 'en' ? AppComponent.setEnglishLang() : AppComponent.setArabicLang();
  }

  private static setEnglishLang(): void {
    const html = document.querySelector('html') as HTMLElement;
    const style: HTMLLinkElement = document.querySelector('link[href="bootstrap-rtl.css"]') as HTMLLinkElement;
    html.dir = 'ltr';
    html.lang = 'en';
    style.href = 'bootstrap.css';
  }

  private static setArabicLang(): void {
    const html = document.querySelector('html') as HTMLElement;
    const style: HTMLLinkElement = document.querySelector('link[href="bootstrap.css"]') as HTMLLinkElement;
    html.dir = 'rtl';
    html.lang = 'ar';
    style.href = 'bootstrap-rtl.css';
  }


  ngAfterViewInit(): void {

  }

  @HostListener('window:keydown', ['$event'])
  languageChangeDetection({ctrlKey, altKey, which, keyCode}: KeyboardEvent): void {
    if ((keyCode === 76 || which === 76) && ctrlKey && altKey) {
      const lang = document.querySelector('html')?.lang;
      AppComponent.setLanguage(lang === 'en' ? 'ar' : 'en');
    }
  }


}
