import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {IGridAction} from '../../../interfaces/i-grid-action';

@Component({
  selector: 'app-bulk-actions',
  templateUrl: './bulk-actions.component.html',
  styleUrls: ['./bulk-actions.component.scss']
})
export class BulkActionsComponent implements OnInit {
  @HostBinding('class') containerClass = 'col-md-8 col-sm-12';

  @Input() actionsList!: IGridAction[];
  @Input() selectedRecords!: any[];

  actions: IGridAction[] = [];

  constructor(public langService: LangService) {
  }

  ngOnInit() {
    if (this.selectedRecords.length === 0) {
      this.actions = [];
    }
    this.actions = this.actionsList.filter((action: IGridAction) => {
      return action.show && action.show(this.selectedRecords);
    });
  }

  callback($event: MouseEvent, action: IGridAction): any {
    action.callback && action.callback($event);
  }

}
