import {Directive, HostBinding, Input, OnInit} from '@angular/core';
import {QueryResult} from "@app/models/query-result";

@Directive({
  selector: '[riskStatus]'
})
export class RiskStatusDirective implements OnInit {
  @Input()
  model!: QueryResult

  @HostBinding('class')
  riskStatus: string = '';

  classList: Record<number, string> = {
    1: '',
    2: 'risk',
    3: 'overdue'
  };


  constructor() {
  }

  ngOnInit(): void {
    this.riskStatus = this.classList[this.model.riskStatusInfo.lookupKey!];
  }

}
