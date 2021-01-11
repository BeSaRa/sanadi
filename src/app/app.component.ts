import {Component, Host, HostListener} from '@angular/core';
import {LangService} from './services/lang.service';
import {AppRootScrollService} from './services/app-root-scroll.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sanadi';

  constructor(private langService: LangService, private appScrollService: AppRootScrollService) {
  }

  @HostListener('window:keydown', ['$event'])
  languageChangeDetection({ctrlKey, altKey, which, keyCode}: KeyboardEvent): void {
    if ((keyCode === 76 || which === 76) && ctrlKey && altKey) {
      this.langService.toggleLanguage();
    }
  }

  @HostListener('scroll', ['$event'])
  scroll({target: {scrollTop: scroll}}: any): void {
    this.appScrollService.emitScrollEvent(scroll);
  }
}
