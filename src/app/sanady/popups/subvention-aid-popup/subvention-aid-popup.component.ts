import {Component, Inject, OnInit} from '@angular/core';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {LangService} from '@app/services/lang.service';
import {SubventionAid} from '@app/models/subvention-aid';
import {AidLookup} from '@app/models/aid-lookup';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {FormControl} from '@angular/forms';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {DateUtils} from '@app/helpers/date-utils';

@Component({
  selector: 'app-subvention-aid-popup',
  templateUrl: './subvention-aid-popup.component.html',
  styleUrls: ['./subvention-aid-popup.component.scss']
})
export class SubventionAidPopupComponent implements OnInit {

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
    'givenAmount',
    'totalPaidAmount'
  ];
  headerColumn: string[] = ['extra-header'];
  filterControl: FormControl = new FormControl('');

  periodicityLookups: Record<number, Lookup> = {};
  subAidLookup: Record<number, AidLookup> = {} as Record<number, AidLookup>;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  ngOnInit(): void {
    this.preparePeriodicityLookups();
  }

  sortingCallbacks = {
    approvalDate: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.approvalDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.approvalDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    requestedAidCategory: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidLookupParentInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidLookupParentInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    requestedAid: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidLookupInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidLookupInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    estimatedAmount: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidSuggestedAmount,
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidSuggestedAmount;
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    periodicity: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.periodicTypeInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.periodicTypeInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    paymentDate: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.aidStartPayDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.aidStartPayDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    givenAmount: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidAmount,
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidAmount;
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    totalPaidAmount: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidPayedAmount,
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidPayedAmount;
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    remainingAmount: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidRemainingAmount,
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidRemainingAmount;
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
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
