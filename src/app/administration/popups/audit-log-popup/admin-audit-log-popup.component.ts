import {Component, Inject, OnInit} from '@angular/core';
import {UserClickOn} from '@enums/user-click-on.enum';
import {AuditLog} from '@models/audit-log';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@contracts/i-dialog-data';
import {LangService} from '@services/lang.service';
import {UntypedFormControl} from '@angular/forms';

@Component({
  selector: 'app-admin-audit-log-popup',
  templateUrl: './admin-audit-log-popup.component.html',
  styleUrls: ['./admin-audit-log-popup.component.scss']
})
export class AdminAuditLogPopupComponent implements OnInit {
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
