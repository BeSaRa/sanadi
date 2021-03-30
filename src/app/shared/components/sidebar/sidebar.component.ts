import {Component, ElementRef, HostBinding, HostListener, OnInit, Renderer2} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';
import {MenuItemService} from '../../../services/menu-item.service';
import {MenuItem} from '../../../models/menu-item';
import {Direction} from '@angular/cdk/bidi';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {LangService} from '../../../services/lang.service';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('openCloseHoverInOut', [
      state('opened', style({
        width: '250px'
      })),
      state('closed', style({
        width: '60px'
      })),
      state('hoverIn', style({
        width: '250px'
      })),
      state('hoverOut', style({
        width: '60px'
      })),
      transition('opened <=> closed', animate('250ms ease-in-out')),
      transition('hoverIn <=> hoverOut', animate('250ms ease-in-out')),
      transition('hoverOut <=> opened', animate('250ms ease-in-out')),
      transition('closed <=> hoverIn', animate('250ms ease-in-out')),
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
  searchInput: FormControl = new FormControl('');

  @HostBinding('class.sidebar-opened')
  isOpened: boolean = true;

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
              private renderer: Renderer2,
              public langService: LangService) {
  }

  ngOnInit(): void {
    this.langService
      .onLanguageChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.scrollDirection = language.direction;
      });
  }


  toggle(): void {
    this.isOpened ? this.startClose() : this.startOpen();
  }

  sidebarMouseEnter(): void {
    if (!this.isOpened) {
      this.sidebarAnimation = 'hoverIn';
    }
  }

  sidebarMouseOut(): void {
    if (!this.isOpened) {
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


  }
}
