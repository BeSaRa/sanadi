import {Component, Input} from '@angular/core';
import {LangService} from '@services/lang.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {UntypedFormControl} from '@angular/forms';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {DateUtils} from '@helpers/date-utils';
import {GdxSjcMaritalStatusResponse} from '@models/gdx-sjc-marital-status-response';

@Component({
  selector: 'sjc-related-data-list',
  templateUrl: './sjc-related-data-list.component.html',
  styleUrls: ['./sjc-related-data-list.component.scss']
})
export class SjcRelatedDataListComponent {
  @Input() list: GdxSjcMaritalStatusResponse[] = [];

  constructor(public lang: LangService) {
  }

  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  headerColumn: string[] = ['extra-header'];
  displayedColumns: string[] = ['married', 'marriageDate'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  sortingCallbacks = {
    marriageDate: (a: GdxSjcMaritalStatusResponse, b: GdxSjcMaritalStatusResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.marriageDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.marriageDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };
  actions: IMenuItem<GdxSjcMaritalStatusResponse>[] = [];
}
