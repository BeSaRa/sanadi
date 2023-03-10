import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {CommonUtils} from '@app/helpers/common-utils';

@Component({
  selector: 'app-bulk-actions',
  templateUrl: './bulk-actions.component.html',
  styleUrls: ['./bulk-actions.component.scss']
})
export class BulkActionsComponent implements OnInit {
  @HostBinding('class') containerClass = 'col-md-6 col-sm-12';

  @Input() actionsList!: IGridAction[];
  @Input() selectedRecords!: any[];
  @Input() hideSelectCount: boolean = false;
  @Input() reversedColors :boolean = false;
  actions: IGridAction[] = [];

  constructor(public langService: LangService) {
  }

  checkShow(action: IGridAction): boolean {
    if (!CommonUtils.isValidValue(action.show)) {
      return true;
    }
    if (action.children && action.children.length > 0) {
      action.children = action.children.filter((child: IGridAction) => {
        return this.checkShow(child);
      });
      return action.children.length > 0;
    }
    // @ts-ignore
    return action.show(this.selectedRecords);
  }

  ngOnInit() {
    if (this.selectedRecords.length === 0) {
      this.actions = [];
    }
    this.actions = this.actionsList.filter((action: IGridAction) => {
      return this.checkShow(action);
    });
  }

  callback($event: MouseEvent, action: IGridAction): any {
    action.callback && action.callback($event, action.data);
  }

}
