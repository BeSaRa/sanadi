import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {IGridAction} from '../../../interfaces/i-grid-action';

@Component({
  selector: 'app-bulk-actions',
  templateUrl: './bulk-actions.component.html',
  styleUrls: ['./bulk-actions.component.scss']
})
export class BulkActionsComponent {
  @HostBinding('class') containerClass = 'col-8';

  @Input() actionsList!: IGridAction[];
  @Input() selectedRecords!: any[];

  constructor(public langService: LangService) {
  }

  callback(action: IGridAction, $event: MouseEvent): any {
    action.callback($event);
  }

}
