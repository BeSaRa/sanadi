import {AfterContentInit, Component, ContentChildren, EventEmitter, Input, NgZone, OnDestroy, Output, QueryList} from '@angular/core';
import {TabComponent} from '../tab/tab.component';
import {take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'tabs-list , [tabs-list]',
  templateUrl: './tabs-list.component.html',
  styleUrls: ['./tabs-list.component.scss']
})
export class TabsListComponent implements OnDestroy, AfterContentInit {
  static aliveTabsCount: number = 0;
  tabContainerId: string = '';
  tabContainerNumber: number = 0;
  _activeTabIndex: number = 0;
  @Input()
  set activeTabIndex(value: number) {
    if (value) {
      this._activeTabIndex = value;
    }
    const tab = this.getTabByIndex(this.activeTabIndex);
    if (tab) {
      this.selectTab(tab);
    }
  }

  get activeTabIndex(): number {
    return this._activeTabIndex;
  };

  @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;
  private destroy$: Subject<any> = new Subject<any>();
  @Output() onTabChange: EventEmitter<TabComponent> = new EventEmitter<TabComponent>();

  constructor(private ngZone: NgZone) {
    ++TabsListComponent.aliveTabsCount;
    this.tabContainerNumber = TabsListComponent.aliveTabsCount;
    this.tabContainerId = 'tab-list-' + this.tabContainerNumber;
  }

  ngOnDestroy(): void {
    --TabsListComponent.aliveTabsCount;
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngAfterContentInit(): void {
    this.prepareTabs();
    this.tabs.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.ngZone.onStable.pipe(take(1))
        .subscribe(() => {
          this.prepareTabs();
        });
    });
    this.selectFirstTabIfThereIsNoActiveIndex();
  }

  /**
   * @description prepare tabs and indexes
   * @private
   */
  private prepareTabs(): void {
    this.tabs.forEach((tab, index) => {
      tab.tabId = '#' + this.tabContainerId + '-tab-' + index;
      tab.tabIndex = index;
    });
  }

  /**
   * @description select first tab if there is no Active tab Index provided by user.
   * @private
   */
  private selectFirstTabIfThereIsNoActiveIndex(): void {
    if (!this.tabs.length) {
      return;
    }
    let tab;
    if (this.activeTabIndex) {
      tab = this.getTabByIndex(this.activeTabIndex);
    }
    this.selectTab(tab || this.tabs.first);
  }

  private getTabByIndex(index: number): TabComponent | undefined {
    if (!this.tabs) {
      return undefined;
    }
    return this.tabs.find(tab => {
      return tab.tabIndex === index;
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
    this.tabs.forEach(item => {
      item.tabIndex === tab.tabIndex ? (item.active = true) : (item.active = false);
    });
    this.onTabChange.emit(tab);
  }
}
