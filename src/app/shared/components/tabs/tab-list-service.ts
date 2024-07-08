import {EventEmitter, Injectable, OnDestroy, QueryList} from '@angular/core';
import {TabComponent} from '../tab/tab.component';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class TabListService implements OnDestroy {
  static id: number = 0;
  containerId: number = 0;
  tabs!: QueryList<TabComponent>;
  destroy$: Subject<void> = new Subject();
  hasTabs: boolean = false;
  changeSelectedTabTo$: Subject<TabComponent> = new Subject();
  activeTabIndex: number = 0;
  onSelectTabChange$: Observable<TabComponent> = this.changeSelectedTabTo$.asObservable();
  onTabChangeEvent!: EventEmitter<TabComponent>;
  public accordionView: boolean = false;
  public hasForm: boolean = false;
  collapse: boolean = false;
  scrollToViewPort: boolean = false;
  scrollOnInit: boolean = false;


  constructor() {
    ++TabListService.id;
    this.containerId = TabListService.id;
  }

  ngOnDestroy(): void {
    --TabListService.id;
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  setTabs(tabs: QueryList<TabComponent>, activeTabIndex: number, collapse: boolean, scrollToViewPort: boolean,
          scrollOnInit: boolean, skipSetFirstAccordionItemActive: boolean, onTabChangeEvent: EventEmitter<TabComponent>): void {
    this.tabs = tabs;
    this.collapse = collapse;
    this.hasTabs = true;
    this.onTabChangeEvent = onTabChangeEvent;
    this.scrollToViewPort = scrollToViewPort;
    this.scrollOnInit = scrollOnInit;
    this.activeTabIndex = typeof activeTabIndex !== undefined ? activeTabIndex : 0;
    if (this.tabs.length) {
      if (!this.accordionView || !skipSetFirstAccordionItemActive) {
        this.selectActiveIndexOrFirst();
      }
    }
  }

  private selectActiveIndexOrFirst(): void {
    if (this.tabs.length >= this.activeTabIndex) {
      this.selectTabByIndex(this.activeTabIndex);
    }
  }

  selectTabByIndex(index: number): void {
    const tab = this.findTabByIndex(index);
    tab && !tab.disabled && (tab.expansionState = 'open');
    this.changeSelectedTabTo$.next(tab!);
    this.onTabChangeEvent.emit(tab);
  }

  private findTabByIndex(index: number): TabComponent | undefined {
    return this.tabs.find((tab, tabIndex) => tabIndex === index);
  }

  activeNextOrPrevTabBasedOn(destroyedTab: TabComponent) {
    let index = this.tabs.toArray().indexOf(destroyedTab);
    // to give the tabs chance to remove the destroyed one then will apply the select on the index or index - 1
    Promise.resolve().then(() => {
      if (this.tabs.length > index) {
        this.selectTabByIndex(index);
      } else {
        this.selectTabByIndex(--index);
      }
    });
  }
}
