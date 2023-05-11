import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChildren,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  Self,
  TemplateRef
} from '@angular/core';
import {TabComponent} from '../tab/tab.component';
import {of, Subject} from 'rxjs';
import {TabListService} from './tab-list-service';
import {delay, takeUntil} from 'rxjs/operators';
import {EmployeeService} from '@app/services/employee.service';

@Component({
  selector: 'tabs-list , [tabs-list]',
  templateUrl: './tabs-list.component.html',
  styleUrls: ['./tabs-list.component.scss'],
  providers: [
    TabListService
  ]
})
export class TabsListComponent implements OnDestroy, AfterContentInit, OnInit, AfterViewInit {
  @Input() activeTabIndex: number = 0;
  @Input() tabByIndex$!: Subject<number>;
  @Input() accordionView: boolean = false;
  @Input() accordionButtonClass: string = '';
  @Input() hasForm: boolean = false;
  @Input() scrollToViewPort: boolean = true;
  @Input() scrollOnInit: boolean = false;
  @Input() extraButtonsTemplate?: TemplateRef<any>;
  @Input() extraButtonsPositioning: 'relative' | 'flex' = 'flex';

  private _collapse: boolean = false;
  @Input()
  set collapse(value: boolean) {
    this._collapse = value;
    this.tabListService.collapse = value ?? false;
  }

  get collapse(): boolean {
    return this._collapse;
  }

  static aliveTabsCount: number = 0;
  private destroy$: Subject<any> = new Subject<any>();

  @HostBinding('class')
  paddingClass: string = '';

  tabContainerId: string = '';
  tabContainerNumber: number = 0;
  accordionContainerId: string = '';
  private _ready: boolean = false;

  get ready(): boolean {
    return this._ready;
  }

  @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;
  @Output() onTabChange: EventEmitter<TabComponent> = new EventEmitter<TabComponent>();

  constructor(@Self() public tabListService: TabListService, private employeeService: EmployeeService) {
    this.tabContainerNumber = this.tabListService.containerId;
    this.tabContainerId = 'tab-list-' + this.tabContainerNumber;
    this.accordionContainerId = 'accordion-' + this.tabContainerNumber;
  }

  ngOnInit(): void {
    this.tabListService.accordionView = this.accordionView;
    this.tabListService.hasForm = this.hasForm;
    this.listenToOutSideTabChange();
    this.paddingClass = this.employeeService.getCurrentUser() ? (this.employeeService.isExternalUser() ? '' : 'pb-2') : '';
  }

  private listenToOutSideTabChange() {
    if (this.tabByIndex$) {
      this.tabByIndex$
        .pipe(takeUntil(this.destroy$))
        .subscribe(index => this.tabListService.selectTabByIndex(index));
    }
  }

  ngOnDestroy(): void {
    --TabsListComponent.aliveTabsCount;
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngAfterContentInit(): void {
    this.tabListService.setTabs(this.tabs, this.activeTabIndex, this.collapse, this.scrollToViewPort, this.scrollOnInit, this.onTabChange);
  }

  ngAfterViewInit() {
    of(this.tabs)
      .pipe(takeUntil(this.destroy$))
      .pipe(delay(200))
      .subscribe((tabs) => {
        tabs.forEach((tab) => {
          tab.isReady = true;
          this.accordionView && (tab.tabListAccordionButtonClass = this.accordionButtonClass);
        });
        this._ready = true;
      });
  }

  /**
   * @description make the tab selected
   * @param tab
   */
  selectTab(tab: TabComponent) {
    if (tab.active) {
      return;
    }
    this.tabListService.changeSelectedTabTo$.next(tab);
    this.onTabChange.emit(tab);
  }

  getActiveTabIndex(): number {
    return this.tabs.toArray().findIndex(x => x.active) ?? 0;
  }

  getNextActiveTabIndex(): number {
    const currentActiveIndex = this.getActiveTabIndex();
    return this._getAllTabsStatus().findIndex((isActive, index) => isActive && index > currentActiveIndex);
  }

  getPreviousActiveTabIndex(): number {
    const currentActiveIndex = this.getActiveTabIndex();
    return this._getAllTabsStatus().slice(0, currentActiveIndex - 1).lastIndexOf(true);
  }

  getFirstActiveTabIndex(): number {
    return this._getAllTabsStatus().indexOf(true) ?? 0;
  }

  getLastActiveTabIndex(): number {
    return this._getAllTabsStatus().lastIndexOf(true) ?? 0;
  }

  isFirstActiveTab(): boolean {
    return this.getActiveTabIndex() === this.getFirstActiveTabIndex();
  }

  isLastActiveTab(): boolean {
    return this.getActiveTabIndex() === this.getLastActiveTabIndex();
  }

  isIndexOutOfBound(index: number): boolean {
    return index < 0 || index >= this.tabs.length;
  }

  private _getAllTabsStatus(): boolean[] {
    return this.tabs.toArray().map(x => !x.disabled);
  }
}
