import {Component, Inject, OnInit} from '@angular/core';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {LangService} from '../../../services/lang.service';
import {SubventionAid} from '../../../models/subvention-aid';
import {AidLookup} from '../../../models/aid-lookup';
import {Lookup} from '../../../models/lookup';
import {LookupService} from '../../../services/lookup.service';
import {CustomValidators} from '../../../validators/custom-validators';

@Component({
  selector: 'app-subvention-aid-popup',
  templateUrl: './subvention-aid-popup.component.html',
  styleUrls: ['./subvention-aid-popup.component.scss']
})
export class SubventionAidPopupComponent implements OnInit {
  aidList: SubventionAid[] = [];
  isPartialRequest: boolean = false;

  userClick: typeof UserClickOn = UserClickOn;
  displayedColumns = [
    'approvalDate',
    'aidLookupId',
    'estimatedAmount',
    'periodicType',
    'installementsCount',
    'aidStartPayDate',
    'givenAmount'
  ];
  periodicityLookups: Record<number, Lookup> = {};
  subAidLookup: Record<number, AidLookup> = {} as Record<number, AidLookup>;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  constructor(@Inject(DIALOG_DATA_TOKEN) public data: { aidList: SubventionAid[], isPartial: boolean },
              public lookupService: LookupService,
              public langService: LangService) {
    this.aidList = data.aidList;
    this.isPartialRequest = data.isPartial;
    //remainingAmount (show if not partial request)
    if (!data.isPartial) {
      this.displayedColumns.push('remainingAmount');
    }
  }

  ngOnInit(): void {
    this.preparePeriodicityLookups();
  }

  private preparePeriodicityLookups(): void {
    this.periodicityLookups = this.lookupService.listByCategory.SubAidPeriodicType.reduce((acc, item) => {
      return {...acc, [item.lookupKey]: item};
    }, {} as Record<number, Lookup>);
  }

  getLookup(lookupKey: number): Lookup {
    return this.periodicityLookups[lookupKey];
  }

  getAidLookup(id: number): AidLookup {
    return this.subAidLookup[id];
  }
}
