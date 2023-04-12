import {Component, Inject} from '@angular/core';
import {LangService} from '@services/lang.service';
import {IValueDifference} from '@contracts/i-value-difference';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {AdminResult} from '@models/admin-result';

@Component({
  selector: 'case-audit-differences-popup',
  templateUrl: './case-audit-differences-popup.component.html',
  styleUrls: ['./case-audit-differences-popup.component.scss']
})
export class CaseAuditDifferencesPopupComponent {

  constructor(@Inject(DIALOG_DATA_TOKEN) public data: { titleInfo: AdminResult, differencesList: IValueDifference[] },
              public lang: LangService) {
  }

  get popupTitle(): string {
    return this.lang.map.differences + (this.data.titleInfo ? ' : ' + this.data.titleInfo.getName() : '');
  }
}
