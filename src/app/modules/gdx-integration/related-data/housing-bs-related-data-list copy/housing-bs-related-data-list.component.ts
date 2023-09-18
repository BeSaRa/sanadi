import { DateUtils } from '@helpers/date-utils';
import { SortEvent } from '@app/interfaces/sort-event';
import { CommonUtils } from '@app/helpers/common-utils';
import { GdxMsdfHousingResponse } from '@app/models/gdx-msdf-housing';
import { Component, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import {CustomValidators} from "@app/validators/custom-validators";

@Component({
  selector: 'housing-bs-related-data-list',
  templateUrl: './housing-bs-related-data-list.component.html',
  styleUrls: ['./housing-bs-related-data-list.component.scss']
})
export class HousingBSRelatedDataListComponent {
  @Input() list: GdxMsdfHousingResponse[] = [];

  constructor(public lang: LangService) {
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  headerColumn: string[] = ['extra-header'];

  displayedColumns: string[] = [
    'beneficiaryType',
    'beneficiaryDate',
    'status',
  ];
  filterControl: UntypedFormControl = new UntypedFormControl('');

  sortingCallbacks = {
    aidStartPayDate: (a: GdxMsdfHousingResponse, b: GdxMsdfHousingResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.beneficiaryDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.beneficiaryDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction)
    },
  }
  actions: IMenuItem<GdxMsdfHousingResponse>[] = [];
}
