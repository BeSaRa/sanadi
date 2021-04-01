import {AfterContentInit, Component, ContentChildren, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList} from '@angular/core';
import {TabComponent} from '../tab/tab.component';
import {Subject} from 'rxjs';
import {TabListService} from './tab-list-service';
import {takeUntil} from 'rxjs/operators';

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
  static aliveTabsCount: number = 0;
  private destroy$: Subject<any> = new Subject<any>();

  tabContainerId: string = '';
  tabContainerNumber: number = 0;

  @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;
  @Output() onTabChange: EventEmitter<TabComponent> = new EventEmitter<TabComponent>();

  constructor(private tabListService: TabListService) {
    this.tabContainerNumber = this.tabListService.containerId;
    this.tabContainerId = 'tab-list-' + this.tabContainerNumber;
  }

  ngOnInit(): void {
    this.listenToOutSideTabChange();
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
    this.tabListService.setTabs(this.tabs, this.activeTabIndex);
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
}
