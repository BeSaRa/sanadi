import {Component, Input} from '@angular/core';
import {GdxKahramaaResponse} from '@app/models/gdx-kahramaa-response';
import {LangService} from '@services/lang.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {UntypedFormControl} from '@angular/forms';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';

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
  displayedColumns: string[] = ['amount', 'fees', 'fine'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  sortingCallbacks = {};
  actions: IMenuItem<GdxKahramaaResponse>[] = [];
}
