import {Component, ElementRef, HostBinding, HostListener, OnInit, Renderer2} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';
import {MenuItemService} from '@app/services/menu-item.service';
import {MenuItem} from '@app/models/menu-item';
import {Direction} from '@angular/cdk/bidi';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {LangService} from '@app/services/lang.service';
import {UntypedFormControl} from '@angular/forms';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {AuthService} from '@app/services/auth.service';
import {DialogService} from '@app/services/dialog.service';
import {Router} from '@angular/router';
import {ToastService} from '@app/services/toast.service';
import {NavigationService} from '@app/services/navigation.service';
import {EmployeeService} from '@app/services/employee.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('openCloseHoverInOut', [
      state('opened', style({
        width: '300px'
      })),
      state('closed', style({
        width: '60px'
      })),
      state('hoverIn', style({
        width: '300px'
      })),
      state('hoverOut', style({
        width: '60px'
      })),
      transition('opened <=> closed', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')),
      transition('hoverIn <=> hoverOut', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')),
      transition('hoverOut <=> opened', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')),
      transition('closed <=> hoverIn', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')),
      transition('hoverIn <=> opened', animate(0))
    ])
  ]
})
export class SidebarComponent implements OnInit {
  @HostBinding('@openCloseHoverInOut')
  sidebarAnimation: 'opened' | 'closed' | 'hoverIn' | 'hoverOut' = 'opened';
  topImage: string = 'url(assets/images/top-pattern.png)';
  bottomImage: string = 'url(assets/images/bottom-pattern.png)';
  items: MenuItem[] = this.menuItemService.parents;
  scrollDirection: Direction = 'ltr';
  destroy$: Subject<any> = new Subject<any>();
  searchInput: UntypedFormControl = new UntypedFormControl('');
  isExternalUser: boolean = this.employeeService.isExternalUser();

  @HostBinding('class.sidebar-opened')
  isOpened: boolean = true;
  private ongoingState: boolean = false;

  @HostBinding('class.sidebar-closed')
  get isClosed(): boolean {
    return !this.isOpened && this.sidebarAnimation !== 'hoverIn';
  }

  @HostBinding('class.sidebar-opened-hover')
  get openedByHover(): boolean {
    return this.sidebarAnimation === 'hoverIn';
  }


  searchText: Observable<string> = this.searchInput
    .valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged()
    );

  constructor(private menuItemService: MenuItemService,
              private element: ElementRef,
              private authService: AuthService,
              private dialogService: DialogService,
              private renderer: Renderer2,
              private toastService: ToastService,
              public navigationService: NavigationService,
              private employeeService: EmployeeService,
              private router: Router,
              public langService: LangService) {
  }

  ngOnInit(): void {
    this.langService
      .onLanguageChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.scrollDirection = language.direction;
      });
    this.isOpened ? this.startOpen() : this.startClose();
    this._listenToResetMenus();
  }

  private _listenToResetMenus(): void {
    this.menuItemService.resetMenuItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.items = this.menuItemService.parents;
      });
  }


  toggle(): void {
    this.isOpened ? this.startClose() : this.startOpen();
  }

  sidebarMouseEnter(): void {
    if (!this.isOpened && !this.ongoingState) {
      this.sidebarAnimation = 'hoverIn';
    }
  }

  sidebarMouseOut(): void {
    if (!this.isOpened && !this.ongoingState) {
      this.sidebarAnimation = 'hoverOut';
    }
  }

  pinSidebar() {
    this.startOpen();
  }

  private startClose() {
    this.sidebarAnimation = 'closed';
  }

  private startOpen() {
    this.sidebarAnimation = 'opened';
  }

  @HostListener('@openCloseHoverInOut.start', ['$event'])
  animationStartCallBack(event: AnimationEvent): void {
    if (event.toState === 'opened' || event.toState === 'hoverIn') {
      this.renderer.addClass(this.element.nativeElement, 'going-to-open');
    }

    if (event.toState === 'hoverOut' || event.toState === 'closed') {
      this.renderer.addClass(this.element.nativeElement, 'going-to-close');
    }
    this.ongoingState = true;
  }

  @HostListener('@openCloseHoverInOut.done', ['$event'])
  animationDoneCallback(event: AnimationEvent): void {
    if (event.fromState === 'closed' && event.toState === 'opened') {
      this.isOpened = true;
    }

    if (event.fromState === 'opened' && event.toState === 'closed') {
      this.isOpened = false;
    }

    if (event.fromState === 'hoverOut' && event.toState === 'opened') {
      this.isOpened = true;
    }

    if (event.fromState === 'hoverIn' && event.toState === 'opened') {
      this.isOpened = true;
    }

    this.renderer.removeClass(this.element.nativeElement, 'going-to-open');
    this.renderer.removeClass(this.element.nativeElement, 'going-to-close');
    this.ongoingState = false;
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
      this.router.navigate([this.isExternalUser ? '/login-external' : '/login']).then(() => {
        this.toastService.success(this.langService.map.msg_logout_success);
      });
    });
  }

  goToHome(): void {
    this.router.navigate(['home', 'main']).then();
  }

  goToBack() {
    this.navigationService.goToBack();
  }
}
