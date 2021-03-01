import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {AppRootScrollService} from '../../../services/app-root-scroll.service';
import {LangService} from '../../../services/lang.service';
import {AuthService} from '../../../services/auth.service';
import {ToastService} from '../../../services/toast.service';
import {Router} from '@angular/router';
import {DialogService} from '../../../services/dialog.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {UrlService} from '../../../services/url.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  /**
   * @description header element to use it later to attach/detach
   */
  @ViewChild('header') element: ElementRef | undefined;
  scrollSubscription: Subscription | undefined;

  constructor(private scrollService: AppRootScrollService,
              public langService: LangService,
              private toastService: ToastService,
              private router: Router,
              private dialogService: DialogService,
              private authService: AuthService,
              public urlService: UrlService) {
  }

  ngOnInit(): void {
    this.scrollService.onScroll$.subscribe((scroll) => this.onScroll(scroll));
  }

  /**
   * @description eventListener callback to listen to scroll event on the window.
   */
  onScroll(scroll: number): void {
    if (scroll >= 40) {
      this._attachSticky();
    } else {
      this._detachSticky();
    }
  }

  /**
   * @description private method to attach "Sticky" class to main navbar.
   * @private
   */
  private _attachSticky(): void {
    if (!this.element?.nativeElement.classList.contains('sticky')) {
      this.element?.nativeElement.classList.add('sticky');
    }
  }

  /**
   * @description private method to detach "Sticky" class from main navbar.
   * @private
   */
  private _detachSticky(): void {
    if (this.element?.nativeElement.classList.contains('sticky')) {
      this.element?.nativeElement.classList.remove('sticky');
    }
  }

  ngOnDestroy(): void {
    this.scrollSubscription?.unsubscribe();
  }

  toggleLanguage(event: MouseEvent) {
    event.preventDefault();
    this.langService.toggleLanguage();
  }

  logout(event: MouseEvent) {
    event.preventDefault();
    this.dialogService.confirm(this.langService.map.msg_are_you_sure_you_want_logout).onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        this.authService.logout().subscribe(() => {
          this.toastService.success(this.langService.map.msg_logout_success);
          return this.router.navigate(['/']);
        });
      }
    });
  }
}
