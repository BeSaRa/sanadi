import {Component, Host, Input, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {TabListService} from '../tabs/tab-list-service';
import {delay, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'tab , [tab]',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent implements OnInit, OnDestroy {
  @Input() title!: string;
  active: boolean = false;
  @Input() template!: TemplateRef<any>;
  @Input() name!: string;
  @Input() hasError: boolean = false;
  @Input() disabled: boolean = false;
  @Input() tabWidth?: string;
  private destroy$: Subject<any> = new Subject<any>();
  accordionView: boolean = false;
  containerId: number = 0;
  tabId: string = '';
  tabIdRef: string = '';

  constructor(@Host() private tabListService: TabListService) {
  }

  ngOnInit(): void {
    this.accordionView = this.tabListService.accordionView;
    this.containerId = this.tabListService.containerId;
    this.tabId = (this.name || Date.now().toString()) + this.containerId;
    this.tabIdRef = '#' + this.tabId;
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
}
