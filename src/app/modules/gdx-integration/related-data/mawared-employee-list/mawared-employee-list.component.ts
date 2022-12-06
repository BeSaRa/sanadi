import {Component, Input} from '@angular/core';
import {GdxMawaredResponse} from '@app/models/gdx-mawared-response';
import {LangService} from '@services/lang.service';
import {UntypedFormControl} from '@angular/forms';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {CustomValidators} from '@app/validators/custom-validators';

@Component({
  selector: 'mawared-employee-list',
  templateUrl: './mawared-employee-list.component.html',
  styleUrls: ['./mawared-employee-list.component.scss']
})
export class MawaredEmployeeListComponent {
  @Input() list: GdxMawaredResponse[] = [];

  constructor(public lang: LangService) {
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  headerColumn: string[] = ['extra-header'];
  displayedColumns: string[] = ['empNameAr', 'empNameEn', 'empQID', 'entityName', 'entityId', 'firstMonth', 'firstPayment', 'secondMonth', 'secondPayment', 'thirdMonth', 'thirdPayment'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  sortingCallbacks = {};
  actions: IMenuItem<GdxMawaredResponse>[] = [];
}
