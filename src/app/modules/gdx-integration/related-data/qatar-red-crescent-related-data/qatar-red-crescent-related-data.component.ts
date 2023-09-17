import { GdxQatarRedCrescentResponse } from './../../../../models/gdx-qatar-red-crescent-response';
import {Component, Input} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';
import {CommonUtils} from '@app/helpers/common-utils';
import {DateUtils} from '@app/helpers/date-utils';
import {SortEvent} from '@app/interfaces/sort-event';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {LangService} from '@app/services/lang.service';
import {CustomValidators} from '@app/validators/custom-validators';

@Component({
  selector: 'qatar-red-crescent-related-data',
  templateUrl: 'qatar-red-crescent-related-data.component.html',
  styleUrls: ['qatar-red-crescent-related-data.component.scss']
})
export class QatarRedCrescentRelatedDataComponent {
  @Input() list: GdxQatarRedCrescentResponse[] = [];

  constructor(public lang: LangService) {
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  headerColumn: string[] = ['extra-header'];

  displayedColumns: string[] = [
    'approvalDate',
    'aidLookupParentId',
    'aidLookupId',
    'aidSuggestedAmount',
    'periodicType',
    'donorId',
    'installmentsCount',
    'aidStartPayDate',
    'aidAmount',
    'aidRemainingAmount',
    'aidTotalPayedAmount',
  ];
  sortingCallbacks = {
    aidStartPayDate: (a: GdxQatarRedCrescentResponse, b: GdxQatarRedCrescentResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.aidStartPayDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.aidStartPayDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction)
    },
    periodicTypeInfo: (a: GdxQatarRedCrescentResponse, b: GdxQatarRedCrescentResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.periodicTypeInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.periodicTypeInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    aidLookupCategoryInfo: (a: GdxQatarRedCrescentResponse, b: GdxQatarRedCrescentResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidLookupCategoryInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidLookupCategoryInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    aidLookupParentInfo: (a: GdxQatarRedCrescentResponse, b: GdxQatarRedCrescentResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidLookupParentInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidLookupParentInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    aidLookupInfo: (a: GdxQatarRedCrescentResponse, b: GdxQatarRedCrescentResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidLookupInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidLookupInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    donorInfo: (a: GdxQatarRedCrescentResponse, b: GdxQatarRedCrescentResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.donorInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.donorInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  };

  filterControl: UntypedFormControl = new UntypedFormControl('');

  actions: IMenuItem<GdxQatarRedCrescentResponse>[] = [];
}
