import {Component, Inject} from '@angular/core';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {LangService} from '@app/services/lang.service';
import {SubventionAid} from '@app/models/subvention-aid';
import {LookupService} from '@app/services/lookup.service';

@Component({
  selector: 'app-subvention-aid-popup',
  templateUrl: './subvention-aid-popup.component.html',
  styleUrls: ['./subvention-aid-popup.component.scss']
})
export class SubventionAidPopupComponent {

  constructor(@Inject(DIALOG_DATA_TOKEN) public data: { aidList: SubventionAid[], isPartial: boolean },
              public lookupService: LookupService,
              public langService: LangService) {
    this.aidList = data.aidList;
    this.isPartialRequest = data.isPartial;
    //remainingAmount (show if not partial request)
    if (!data.isPartial) {
      this.aidColumns.push('remainingAmount');
    }
  }

  aidList: SubventionAid[] = [];
  isPartialRequest: boolean = false;

  userClick: typeof UserClickOn = UserClickOn;
  aidColumns = [
    'approvalDate',
    'requestedAidCategory',
    'requestedAid',
    'estimatedAmount',
    'periodicType',
    'donor',
    'installmentsCount',
    'aidStartPayDate',
    'givenAmount',
    'totalPaidAmount'
  ];

}
