import {Component, HostListener} from '@angular/core';
import {LangService} from './services/lang.service';
import {AppRootScrollService} from './services/app-root-scroll.service';
import {LoadingService} from './services/loading.service';
import {CacheService} from './services/cache.service';
import {NavigationService} from './services/navigation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sanadi';

  constructor(private langService: LangService,
              public  loadingService: LoadingService,
              private cacheService: CacheService,
              private navigationService: NavigationService,
              private appScrollService: AppRootScrollService) {

    // @ts-ignore
    window['cacheService'] = cacheService;
    this.navigationService.listenRouteChange();
  }

  @HostListener('window:keydown', ['$event'])
  languageChangeDetection({ctrlKey, altKey, which, keyCode}: KeyboardEvent): void {
    if ((keyCode === 76 || which === 76) && ctrlKey && altKey) {
      // ctrl + alt + L
      this.langService.toggleLanguage();
    }
    if ((keyCode === 65 || which === 65) && ctrlKey && altKey) {
      const sub = this.langService.openCreateDialog().onAfterClose$.subscribe(_ => {
        this.langService.load(true);
        sub.unsubscribe();
      });
    }

  }

  @HostListener('scroll', ['$event'])
  scroll({target: {scrollTop: scroll}}: any): void {
    this.appScrollService.emitScrollEvent(scroll);
  }
}
