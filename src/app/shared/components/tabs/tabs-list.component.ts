import {
  AfterContentInit,
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
import {Subject} from 'rxjs';
import {TabListService} from './tab-list-service';
import {takeUntil} from 'rxjs/operators';
import {EmployeeService} from '@app/services/employee.service';

@Component({
  selector: 'tabs-list , [tabs-list]',
  templateUrl: './tabs-list.component.html',
  styleUrls: ['./tabs-list.component.scss'],
  providers: [
    TabListService
  ]
})
export class TabsListComponent implements OnDestroy, AfterContentInit, OnInit {
  @Input() activeTabIndex: number = 0;
  @Input() tabByIndex$!: Subject<number>;
  @Input() accordionView: boolean = false;
  @Input() hasForm: boolean = false;
  @Input() scrollToViewPort: boolean = true;
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

  @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;
  @Output() onTabChange: EventEmitter<TabComponent> = new EventEmitter<TabComponent>();

  constructor(@Self() public tabListService: TabListService, private employeeService: EmployeeService) {
    this.tabContainerNumber = this.tabListService.containerId;
    this.tabContainerId = 'tab-list-' + this.tabContainerNumber;
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
    this.tabListService.setTabs(this.tabs, this.activeTabIndex, this.collapse, this.scrollToViewPort, this.onTabChange);
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
    const tabsStatus = this.tabs.toArray().map(x => !x.disabled);
    return tabsStatus.findIndex((activeTab, index) => activeTab && index > currentActiveIndex) ?? 0;
  }
}
