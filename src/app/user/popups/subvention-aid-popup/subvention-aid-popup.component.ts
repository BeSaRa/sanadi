import {Component, Inject, OnInit} from '@angular/core';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {LangService} from '../../../services/lang.service';
import {SubventionAid} from '../../../models/subvention-aid';
import {AidLookup} from '../../../models/aid-lookup';
import {Lookup} from '../../../models/lookup';
import {LookupService} from '../../../services/lookup.service';

@Component({
  selector: 'app-subvention-aid-popup',
  templateUrl: './subvention-aid-popup.component.html',
  styleUrls: ['./subvention-aid-popup.component.scss']
})
export class SubventionAidPopupComponent implements OnInit {
  userClick: typeof UserClickOn = UserClickOn;
  displayedColumns = [
    'approvalDate',
    'aidLookupId',
    'periodicType',
    'installementsCount',
    'aidStartPayDate',
    'aidAmount'
  ];
  periodicityLookups: Record<number, Lookup> = {};
  subAidLookup: Record<number, AidLookup> = {} as Record<number, AidLookup>;

  constructor(@Inject(DIALOG_DATA_TOKEN) public aidList: SubventionAid[],
              public lookupService: LookupService,
              public langService: LangService) {
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
