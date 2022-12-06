import {Component, Input, ViewChild} from '@angular/core';
import {LangService} from '@services/lang.service';
import {UntypedFormControl} from '@angular/forms';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {GdxPensionMonthPayment} from '@app/models/gdx-pension-month-payment';
import {PaginatorComponent} from '@app/shared/components/paginator/paginator.component';
import {CustomValidators} from '@app/validators/custom-validators';

@Component({
  selector: 'garsia-pension-payment-list',
  templateUrl: './garsia-pension-payment-list.component.html',
  styleUrls: ['./garsia-pension-payment-list.component.scss']
})
export class GarsiaPensionPaymentListComponent {
  @Input() list: GdxPensionMonthPayment[] = [];

  @ViewChild('paginator') paginator!: PaginatorComponent;

  constructor(public lang: LangService) {
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  headerColumn: string[] = ['extra-header'];
  displayedColumns: string[] = ['payAccountNum', 'payMonth', 'payYear', 'payValue'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  sortingCallbacks = {};
  actions: IMenuItem<GdxPensionMonthPayment>[] = [];
}
