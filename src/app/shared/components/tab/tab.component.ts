import {
  AfterViewInit,
  Component,
  ElementRef,
  Host,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {TabListService} from '../tabs/tab-list-service';
import {delay, filter, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';

@Component({
  selector: 'tab , [tab]',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() title!: string;
  active: boolean = false;
  @Input() template!: TemplateRef<any>;
  @Input() name!: string;
  @Input() hasError: boolean = false;
  @Input() disabled: boolean = false;
  @Input() tabWidth?: string;
  @Input() hideIcon?: boolean = false;
  @Input() tabAccordionButtonClasses: string = '';
  @Input() isHidden: boolean = false;

  private destroy$: Subject<void> = new Subject();

  accordionView: boolean = false;
  hasForm: boolean = false;
  containerId: number = 0;
  tabId: string = '';
  tabIdRef: string = '';
  expansionState: 'open' | 'close' = 'close';

  accordionCollapsable: boolean = false;
  accordionIdRef: string = '';
  isReady: boolean = false;
  tabListAccordionButtonClass: string = '';

  @ViewChild('accordionButton') accordionButtonRef!: ElementRef;

  constructor(@Host() private tabListService: TabListService,
              private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    this.accordionView = this.tabListService.accordionView;
    this.hasForm = this.tabListService.hasForm;
    this.containerId = this.tabListService.containerId;
    this.tabId = (this.name || Date.now().toString()) + this.containerId;
    this.tabIdRef = '#' + this.tabId;
    this.expansionState = this.tabListService.collapse ? 'close' : 'open';
    if (this.accordionView) {
      this.accordionCollapsable = this.tabListService.collapse;
      this.accordionIdRef = '#accordion-' + this.tabListService.containerId;
    }
    this.listenToTabChange();
  }

  ngAfterViewInit() {
    Promise.resolve().then(() => {
      if (this.disabled) {
        this.expansionState = 'close';
      }
    })
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
        if (this.accordionView && this.active) {
          this.accordionCollapsable && this.collapseAllInactiveAccordionItems();
          if (this.tabListService.scrollToViewPort) {
            // if scroll on init is enabled, just scroll active tab to visible position
            // otherwise wait until tab is ready
            if (this.tabListService.scrollOnInit) {
              this.scrollToVisiblePosition();
            } else {
              this.isReady && this.scrollToVisiblePosition();
            }
          }
        }
      });
  }

  private collapseAllInactiveAccordionItems(): void {
    this.tabListService.tabs.filter(x => x.tabId !== this.tabId).forEach((item) => {
      item.expansionState = 'close';
    });
  }

  toggleAccordion($event: any) {
    if (this.disabled) {
      this.expansionState = 'close';
      $event.preventDefault();
      return;
    }
    this.expansionState = this.expansionState === 'open' ? 'close' : 'open';

    if (this.expansionState === 'open') {
      this.tabListService.changeSelectedTabTo$.next(this);
      this.tabListService.onTabChangeEvent.emit(this);
      this.tabListService.scrollToViewPort && this.scrollToVisiblePosition();
    }
  }

  private scrollToVisiblePosition() {
    of(this.expansionState)
      .pipe(filter(expansionState => expansionState === 'open'))
      .pipe(delay(200))
      .subscribe((_) => {
        let mainContent = this.elementRef.nativeElement.closest('.dialog-content') ?? document.getElementById('main-content')!;
        if (!this.accordionButtonRef) {
          return;
        }
        let heightOfTabAccordion = this.accordionButtonRef.nativeElement.clientHeight + 10; //added margin/padding to the height
        mainContent.scrollTop = (this.elementRef.nativeElement as HTMLElement).offsetTop - heightOfTabAccordion;
      });
  }

  forceCollapse(): void {
    this.expansionState = 'close';
  }

}
