import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {QueryResult} from "@app/models/query-result";

@Component({
  selector: 'work-item-status',
  templateUrl: './work-item-status.component.html',
  styleUrls: ['./work-item-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkItemStatusComponent {
  @Input()
  item!: QueryResult;

  statusList: Record<number, string> = {
    1: 'bg-success',
    2: 'bg-warning',
    3: 'bg-danger',
  };

  constructor() {
  }

  get riskStatus(): string {
    return this.statusList[this.item.riskStatusInfo.lookupKey!];
  }

}
