import {Component, HostBinding, Input} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {IGridAction} from '../../../interfaces/i-grid-action';

@Component({
  selector: 'app-bulk-actions',
  templateUrl: './bulk-actions.component.html',
  styleUrls: ['./bulk-actions.component.scss']
})
export class BulkActionsComponent {
  @HostBinding('class') containerClass = 'col-md-8 col-sm-12';

  @Input() actionsList!: IGridAction[];
  @Input() selectedRecords!: any[];

  constructor(public langService: LangService) {
  }

  callback($event: MouseEvent, action: IGridAction): any {
    action.callback && action.callback($event);
  }

}
