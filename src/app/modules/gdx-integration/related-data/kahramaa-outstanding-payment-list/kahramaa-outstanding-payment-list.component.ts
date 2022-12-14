import {Component, Input} from '@angular/core';
import {GdxKahramaaResponse} from '@app/models/gdx-kahramaa-response';
import {LangService} from '@services/lang.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {UntypedFormControl} from '@angular/forms';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {DateUtils} from '@helpers/date-utils';

@Component({
  selector: 'kahramaa-outstanding-payment-list',
  templateUrl: './kahramaa-outstanding-payment-list.component.html',
  styleUrls: ['./kahramaa-outstanding-payment-list.component.scss']
})
export class KahramaaOutstandingPaymentListComponent {
  @Input() list: GdxKahramaaResponse[] = [];

  constructor(public lang: LangService) {
  }

  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  headerColumn: string[] = ['extra-header'];
  displayedColumns: string[] = ['qId', 'parentNum', 'tenantNum', 'amount', 'lastInvoiceDate', 'balanceAgingCategory', 'currentMonth',
    'month1To3', 'month1To6', 'month6To12', 'over12Months', 'fees', 'fine'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  sortingCallbacks = {
    lastInvoiceDate: (a: GdxKahramaaResponse, b: GdxKahramaaResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.lastInvoiceDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.lastInvoiceDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    depositPaidDate: (a: GdxKahramaaResponse, b: GdxKahramaaResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.depositPaidDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.depositPaidDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  };
  actions: IMenuItem<GdxKahramaaResponse>[] = [];
}
