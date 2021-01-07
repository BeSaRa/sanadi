import {Component, HostListener} from '@angular/core';
import {LangService} from './services/lang.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sanadi';

  constructor(private langService: LangService) {
  }

  @HostListener('window:keydown', ['$event'])
  languageChangeDetection({ctrlKey, altKey, which, keyCode}: KeyboardEvent): void {
    if ((keyCode === 76 || which === 76) && ctrlKey && altKey) {
      this.langService.toggleLanguage();
    }
  }
}
