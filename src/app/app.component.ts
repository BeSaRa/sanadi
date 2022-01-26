import {Component, HostListener} from '@angular/core';
import {LangService} from './services/lang.service';
import {LoadingService} from './services/loading.service';
import {CacheService} from './services/cache.service';
import {NavigationService} from './services/navigation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private langService: LangService,
              public loadingService: LoadingService,
              private cacheService: CacheService,
              private navigationService: NavigationService) {

    // @ts-ignore
    window['cacheService'] = cacheService;
    this.navigationService.listenRouteChange();
  }

  @HostListener('window:keydown', ['$event'])
  languageChangeDetection({ctrlKey, altKey, which, keyCode}: KeyboardEvent): void {
    if ((keyCode === 76 || which === 76) && ctrlKey && altKey) {
      // ctrl + alt + L
      const sub = this.langService.toggleLanguage().subscribe(() => {
        sub.unsubscribe();
      });
    }
    if ((keyCode === 65 || which === 65) && ctrlKey && altKey) {
      const sub = this.langService.openCreateDialog().onAfterClose$.subscribe(_ => {
        this.langService.load(true);
        sub.unsubscribe();
      });
    }

  }
}
