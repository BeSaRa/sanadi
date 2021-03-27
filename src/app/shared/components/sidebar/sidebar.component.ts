import {Component, HostBinding, HostListener, OnInit} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';
import {MenuItemService} from '../../../services/menu-item.service';
import {MenuItem} from '../../../models/menu-item';
import {Direction} from '@angular/cdk/bidi';
import {takeUntil} from 'rxjs/operators';
import {LangService} from '../../../services/lang.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('openClose', [
      state('opened', style({
        width: '250px'
      })),
      state('closed', style({
        width: '60px'
      })),
      transition('opened <=> closed', animate('250ms ease-in-out'))
    ]),
  ]
})
export class SidebarComponent implements OnInit {
  @HostBinding('@openClose')
  get sidebarState(): string {
    return this.isOpened ? 'opened' : 'closed';
  }

  @HostBinding('class.sidebar-closed')
  get sidebarClosed(): boolean {
    return !this.isOpened;
  }

  @HostBinding('class.sidebar-opened')
  isOpened: boolean = true;
  private openStateChange: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.isOpened);
  openStateChanged$ = this.openStateChange.asObservable();
  topImage: string = 'url(assets/images/top-pattern.png)';
  bottomImage: string = 'url(assets/images/bottom-pattern.png)';
  closeAnimationDone: boolean = false;
  items: MenuItem[] = this.menuItemService.parents;
  scrollDirection: Direction = 'ltr';
  destroy$: Subject<any> = new Subject<any>();

  constructor(private menuItemService: MenuItemService, public langService: LangService) {
  }

  ngOnInit(): void {
    this.langService
      .onLanguageChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.scrollDirection = language.direction;
      });
  }

  @HostListener('@openClose.done', ['$event'])
  animationDone(event: AnimationEvent): void {
    this.closeAnimationDone = event.toState === 'closed';
  }

  @HostListener('@openClose.start', ['$event'])
  animationStart(event: AnimationEvent): void {
    this.closeAnimationDone = event.toState === 'opened' ? false : this.closeAnimationDone;
  }

  toggle(): void {
    this.isOpened ? this.close() : this.open();
  }

  open(): void {
    this.isOpened = true;
    this.openStateChange.next(this.isOpened);
  }

  close(): void {
    this.isOpened = false;
    this.openStateChange.next(this.isOpened);
  }
}
