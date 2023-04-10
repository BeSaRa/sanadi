import {Component, Inject, OnInit} from '@angular/core';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {AuditLog} from '../../../models/audit-log';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {IDialogData} from '../../../interfaces/i-dialog-data';
import {LangService} from '../../../services/lang.service';
import {UntypedFormControl} from '@angular/forms';

@Component({
  selector: 'app-audit-log-popup',
  templateUrl: './audit-log-popup.component.html',
  styleUrls: ['./audit-log-popup.component.scss']
})
export class AuditLogPopupComponent implements OnInit {
  userClick: typeof UserClickOn = UserClickOn;
  displayedColumns: string[] = ['user', 'userOrganization', 'qid', 'ipAddress', 'actionType', 'actionDate'];
  logList: AuditLog[];
  filterControl: UntypedFormControl = new UntypedFormControl('');

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<AuditLog[]>,
              public langService: LangService) {
    this.logList = data.logList;
  }

  ngOnInit(): void {
  }

}
