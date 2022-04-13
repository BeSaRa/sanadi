import {Component, Inject, OnInit} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {SubventionLog} from '@app/models/subvention-log';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {SubventionRequest} from '@app/models/subvention-request';
import {SubventionAid} from '@app/models/subvention-aid';
import {Beneficiary} from '@app/models/beneficiary';
import {SanadiAuditResult} from '@app/models/sanadi-audit-result';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {CustomValidators} from '@app/validators/custom-validators';
import {IKeyValue} from '@app/interfaces/i-key-value';

@Component({
  selector: 'audit-details-popup',
  templateUrl: './audit-details-popup.component.html',
  styleUrls: ['./audit-details-popup.component.scss']
})
export class AuditDetailsPopupComponent {

  auditRecord: SanadiAuditResult;
  auditBeneficiary?: Beneficiary;
  auditSubventionRequest?: SubventionRequest;
  auditSubventionAid?: SubventionAid;

  userClick: typeof UserClickOn = UserClickOn;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<SubventionRequest | SubventionAid | Beneficiary>,
              public lang: LangService,
              private dialogService: DialogService) {
    this.auditRecord = data.record;

    if (this.auditRecord.auditEntity === 'BENEFICIARY') {
      this.auditBeneficiary = data.details;
    } else if (this.auditRecord.auditEntity === 'SUBVENTION_REQUEST') {
      this.auditSubventionRequest = data.details;
    } else if (this.auditRecord.auditEntity === 'SUBVENTION_AID') {
      this.auditSubventionAid = data.details;
    }
  }

  tabsData: IKeyValue = {
    requestInfo: {name: 'requestInfoTab'},
    requestStatus: {name: 'requestStatusTab'}
  }

  preventClick($event: Event): void {
    $event?.preventDefault();
    $event?.stopPropagation();
  }
}
