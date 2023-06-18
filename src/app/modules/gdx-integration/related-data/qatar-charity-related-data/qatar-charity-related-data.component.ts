import {Component, Input} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';
import {CommonUtils} from '@app/helpers/common-utils';
import {DateUtils} from '@app/helpers/date-utils';
import {SortEvent} from '@app/interfaces/sort-event';
import {GdxQatarCharityResponse} from '@app/models/gdx-qatar-charity-response';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {LangService} from '@app/services/lang.service';
import {CustomValidators} from '@app/validators/custom-validators';

@Component({
  selector: 'qatar-charity-related-data',
  templateUrl: 'qatar-charity-related-data.component.html',
  styleUrls: ['qatar-charity-related-data.component.scss']
})
export class QatarCharityRelatedDataComponent {
  @Input() list: GdxQatarCharityResponse[] = [];

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
    aidStartPayDate: (a: GdxQatarCharityResponse, b: GdxQatarCharityResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.aidStartPayDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.aidStartPayDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction)
    },
    periodicTypeInfo: (a: GdxQatarCharityResponse, b: GdxQatarCharityResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.periodicTypeInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.periodicTypeInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    aidLookupCategoryInfo: (a: GdxQatarCharityResponse, b: GdxQatarCharityResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidLookupCategoryInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidLookupCategoryInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    aidLookupParentInfo: (a: GdxQatarCharityResponse, b: GdxQatarCharityResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidLookupParentInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidLookupParentInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    aidLookupInfo: (a: GdxQatarCharityResponse, b: GdxQatarCharityResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidLookupInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidLookupInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    donorInfo: (a: GdxQatarCharityResponse, b: GdxQatarCharityResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.donorInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.donorInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  };

  filterControl: UntypedFormControl = new UntypedFormControl('');

  actions: IMenuItem<GdxQatarCharityResponse>[] = [];
}
