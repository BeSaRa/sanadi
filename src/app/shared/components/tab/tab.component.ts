import {Component, Input, OnDestroy, OnInit, TemplateRef} from '@angular/core';

@Component({
  selector: 'tab , [tab]',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent implements OnInit, OnDestroy {
  @Input() title!: string;
  tabId: string = '';
  tabIndex: number = 0;
  active: boolean = false;
  @Input() template!: TemplateRef<any>;
  @Input() name!: string;
  @Input() hasError: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

}
