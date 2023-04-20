import {Component, ElementRef, EventEmitter, Host, Input, OnDestroy, OnInit, Output, TemplateRef} from '@angular/core';
import {TabListService} from '../tabs/tab-list-service';
import {delay, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'tab , [tab]',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss'],
  animations: [
    trigger('toggleExpand', [
      state('open', style({
        height: '!',
        opacity: 1,
        padding: '*'
      })),
      state('close', style({
        height: 0,
        opacity: 0,
        padding: 0,
        overflow: 'hidden'
      })),
      transition('open <=> close', [
        animate('.250s ease-in-out')
      ])
    ])
  ]
})
export class TabComponent implements OnInit, OnDestroy {
  @Input() title!: string;
  active: boolean = false;
  @Input() template!: TemplateRef<any>;
  @Input() name!: string;
  @Input() hasError: boolean = false;
  @Input() disabled: boolean = false;
  @Input() tabWidth?: string;
  @Input() hideIcon?: boolean = false;

  private destroy$: Subject<any> = new Subject<any>();

  accordionView: boolean = false;
  hasForm: boolean = false;
  containerId: number = 0;
  tabId: string = '';
  tabIdRef: string = '';
  expanded: string = 'close';

  constructor(@Host() private tabListService: TabListService,
              private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    this.accordionView = this.tabListService.accordionView;
    this.hasForm = this.tabListService.hasForm;
    this.containerId = this.tabListService.containerId;
    this.tabId = (this.name || Date.now().toString()) + this.containerId;
    this.tabIdRef = '#' + this.tabId;
    this.expanded = this.tabListService.collapse ? 'close' : 'open';
    this.listenToTabChange();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();

    if (this.active) {
      this.tabListService.activeNextOrPrevTabBasedOn(this);
    }
  }

  private listenToTabChange() {
    this.tabListService.onSelectTabChange$
      .pipe(takeUntil(this.destroy$))
      .pipe(delay(0))
      .subscribe((tab) => {
        this.active = this === tab;
      });
  }

  toggleAccordion($event: any) {
    if (this.tabListService.collapse) {
      this.tabListService.tabs.forEach((t) => {
        if (t != this)
          t.expanded = 'close';
      })
    }
    this.expanded = this.expanded === 'open' ? 'close' : 'open';
    if (this.expanded === 'open') {
      this.tabListService.onTabChangeEvent.emit(this);
    }
    if (this.tabListService.scrollToViewPort) {
      this.scrollToVisiblePosition($event);
    }
  }

  scrollToVisiblePosition($event: any) {
    of(this.expanded)
      .pipe(delay(200))
      .subscribe((expansionStatus) => {
        if (expansionStatus === 'open') {
          let mainContent = this.elementRef.nativeElement.closest('.dialog-content') ?? document.getElementById('main-content')!;
          let heightOfTabAccordion = $event.target.clientHeight + 10; //added margin/padding to the height
          mainContent.scrollTop = (this.elementRef.nativeElement as HTMLElement).offsetTop - heightOfTabAccordion;
        }
      })
  }

}
