import {Component, HostListener, NgZone, OnDestroy, OnInit} from '@angular/core';
import {LangService} from './services/lang.service';
import {AppRootScrollService} from './services/app-root-scroll.service';
import {LoadingService} from './services/loading.service';
import {take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'sanadi';
  displayLoading: boolean = false;
  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private langService: LangService,
              private  loadingService: LoadingService,
              private zone: NgZone,
              private appScrollService: AppRootScrollService) {
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

  ngOnInit(): void {
    this.loadingService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.zone.onStable.pipe(take(1)).subscribe(() => {
          this.displayLoading = value;
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
