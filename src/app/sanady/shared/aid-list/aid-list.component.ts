import {Component, Input, OnInit} from '@angular/core';
import {SubventionAid} from '@app/models/subvention-aid';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {DateUtils} from '@helpers/date-utils';
import {UntypedFormControl} from '@angular/forms';
import {LangService} from '@services/lang.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {BehaviorSubject, Subject} from 'rxjs';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';

@Component({
  selector: 'aid-list',
  templateUrl: './aid-list.component.html',
  styleUrls: ['./aid-list.component.scss']
})
export class AidListComponent implements OnInit {

  constructor(public langService: LangService) {
  }

  @Input() tableTitle!: keyof ILanguageKeys;
  @Input() displayColumns: string[] = [];
  @Input() searchFieldsName: string = 'searchFields';
  @Input() actions: IMenuItem<SubventionAid>[] = [];
  @Input() reloadAid$!: BehaviorSubject<any>;
  @Input() addAid$: Subject<any> = {} as Subject<any>;
  private _allowAdd: boolean = true;
  private _list: SubventionAid[] = [];

  @Input()
  set list(value: SubventionAid[]) {
    this._list = value || [];
  }

  get list(): SubventionAid[] {
    return this._list;
  }

  @Input()
  set allowAdd(value: boolean) {
    this._allowAdd = value;
  }

  get allowAdd(): boolean {
    return this._allowAdd;
  }

  headerColumn: string[] = ['extra-header'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  ngOnInit(): void {
  }

  aidsSortingCallbacks = {
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
    donor: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.donorInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.donorInfo.getName().toLowerCase();
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

}
