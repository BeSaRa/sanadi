import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {OrgUser} from '../../../models/org-user';
import {generateHtmlList} from '../../../helpers/utils';
import {ToastService} from '../../../services/toast.service';
import {LangService} from '../../../services/lang.service';
import {DialogService} from '../../../services/dialog.service';

@Component({
  selector: 'app-bulk-actions',
  templateUrl: './bulk-actions.component.html',
  styleUrls: ['./bulk-actions.component.scss']
})
export class BulkActionsComponent {
  @HostBinding('class') containerClass = 'col-8';

  @Input() actionsList!: any[];
  @Input() selectedRecords!: any[];

  constructor(private toast: ToastService,
              public langService: LangService,
              private dialogService: DialogService) {
  }

  callback(action: any, $event: MouseEvent): any {
    action.actionCallback($event);
  }

}
