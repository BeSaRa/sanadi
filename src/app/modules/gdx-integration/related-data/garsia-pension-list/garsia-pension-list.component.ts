import {Component, EventEmitter, Input, Output} from '@angular/core';
import {GdxGarsiaPensionResponse} from '@app/models/gdx-garsia-pension-response';
import {LangService} from '@services/lang.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {UntypedFormControl} from '@angular/forms';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';

@Component({
  selector: 'garsia-pension-list',
  templateUrl: './garsia-pension-list.component.html',
  styleUrls: ['./garsia-pension-list.component.scss']
})
export class GarsiaPensionListComponent {
  @Input() list: GdxGarsiaPensionResponse[] = [];

  @Output() onSelectPension: EventEmitter<GdxGarsiaPensionResponse> = new EventEmitter<GdxGarsiaPensionResponse>();

  constructor(public lang: LangService) {
  }

  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  headerColumn: string[] = ['extra-header'];
  displayedColumns: string[] = ['pensionArName', 'pensionEmployer', 'pensionStatus', 'firstJoinDate',
    'endOfServiceDate', 'finalServicePeriodYears', 'finalServicePeriodMonths', 'finalServicePeriodDays', 'pensionDeserveDate', 'totalPensionDeserved', 'actions'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  sortingCallbacks = {};
  actions: IMenuItem<GdxGarsiaPensionResponse>[] = [
    // payments
    {
      type: 'action',
      label: 'payments',
      show: () => true,
      onClick: (item: GdxGarsiaPensionResponse) => this.setSelectedPension(item)
    }
  ];

  selectedGarsiaPension?: GdxGarsiaPensionResponse;

  setSelectedPension(item?: GdxGarsiaPensionResponse) {
    this.selectedGarsiaPension = item;
    this.onSelectPension.emit(item);
  }
}
