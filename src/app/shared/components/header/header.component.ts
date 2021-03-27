import {Component, Input, OnInit} from '@angular/core';
import {AppRootScrollService} from '../../../services/app-root-scroll.service';
import {LangService} from '../../../services/lang.service';
import {UrlService} from '../../../services/url.service';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {EmployeeService} from '../../../services/employee.service';
import {AuthService} from '../../../services/auth.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ToastService} from '../../../services/toast.service';
import {DialogService} from '../../../services/dialog.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input()
  sidebar!: SidebarComponent;
  menuState: string = 'mdi-menu';
  destroy$: Subject<any> = new Subject<any>();

  constructor(private scrollService: AppRootScrollService,
              public langService: LangService,
              private dialogService: DialogService,
              private authService: AuthService,
              public employee: EmployeeService,
              private toastService: ToastService,
              private router: Router,
              public urlService: UrlService) {
  }

  ngOnInit(): void {
    this.scrollService.onScroll$.subscribe((scroll) => this.onScroll(scroll));
    this.sidebar.openStateChanged$.subscribe((isOpen) => {
      this.menuState = isOpen ? 'mdi-menu-open' : 'mdi-menu';
    });
  }

  /**
   * @description eventListener callback to listen to scroll event on the window.
   */
  onScroll(scroll: number): void {
    console.log('scrolling : ', scroll);
  }

  toggleSidebar() {
    this.sidebar.toggle();
  }

  toggleLang($event: MouseEvent) {
    $event.preventDefault();
    this.langService.toggleLanguage();
  }

  logout(): void {
    this.dialogService
      .confirm(this.langService.map.msg_are_you_sure_you_want_logout)
      .onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .subscribe((click: UserClickOn) => {
        return click === UserClickOn.YES ? this._logout() : null;
      });
  }

  private _logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']).then(() => {
        this.toastService.success(this.langService.map.msg_logout_success);
      });
    });
  }

  goToHome(): void {
    this.router.navigate(['home', 'main']).then();
  }
}
