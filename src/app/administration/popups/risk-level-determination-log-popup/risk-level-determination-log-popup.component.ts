import { Component, Inject } from '@angular/core';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { AuditLog } from '@app/models/audit-log';
import { RiskLevelDetermination } from '@app/models/risk-level-determination';
import { LangService } from '@app/services/lang.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
    selector: 'risk-level-determination-log-popup',
    templateUrl: 'risk-level-determination-log-popup.component.html',
    styleUrls: ['risk-level-determination-log-popup.component.scss']
})
export class RiskLevelDeterminationLogPopupComponent {
    displayedColumns: (keyof RiskLevelDetermination)[] = ['applicantId','operation', 'auditDate'];
    logList: RiskLevelDetermination[];
  
    constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<AuditLog[]>,
                public langService: LangService) {
      this.logList = data.logList;
    }
}
