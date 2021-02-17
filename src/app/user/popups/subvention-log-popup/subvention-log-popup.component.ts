import {Component, Inject, OnInit} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {SubventionLog} from '../../../models/subvention-log';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {IKeyValue} from '../../../interfaces/i-key-value';
import {LangService} from '../../../services/lang.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';

@Component({
  selector: 'app-subvention-log-popup',
  templateUrl: './subvention-log-popup.component.html',
  styleUrls: ['./subvention-log-popup.component.scss']
})
export class SubventionLogPopupComponent implements OnInit {
  userClick: typeof UserClickOn = UserClickOn;
  displayedColumns: string[] = ['organization', 'branch', 'user', 'actionType', 'actionTime', 'comments'];
  bindingKeys: IKeyValue = {
    organization: (record: any): string => {
      return 'orgInfo.' + this.langService.map.lang + 'Name';
    },
    branch: (record: any): string => {
      return 'orgBranchInfo.' + this.langService.map.lang + 'Name';
    },
    user: (record: any): string => {
      return 'orgUserInfo.' + this.langService.map.lang + 'Name';
    },
    actionType: (record: any): string => {
      return 'actionTypeInfo.' + this.langService.map.lang + 'Name';
    },
    actionTime: 'actionTimeString',
    comments: 'userComments'
  };

  getBindingKey(record: any, columnName: string): string {
    const key = this.bindingKeys[columnName];
    if (typeof key === 'string') {
      return key;
    }
    return key(record);
  }

  constructor(@Inject(DIALOG_DATA_TOKEN) public logList: SubventionLog[],
              public langService: LangService) {
  }

  ngOnInit(): void {
  }

}
