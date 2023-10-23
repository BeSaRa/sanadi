import {GdxMsdfHousingResponse} from '@app/models/gdx-msdf-housing';
import {Component, Input} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {LangService} from '@app/services/lang.service';
import {SortEvent} from "@contracts/sort-event";
import {CommonUtils} from "@helpers/common-utils";

@Component({
  selector: 'housing-bs-related-data-list',
  templateUrl: './housing-bs-related-data-list.component.html',
  styleUrls: ['./housing-bs-related-data-list.component.scss']
})
export class HousingBSRelatedDataListComponent {
  @Input() list: GdxMsdfHousingResponse[] = [];

  constructor(public lang: LangService) {
  }

  headerColumn: string[] = ['extra-header'];

  displayedColumns: string[] = [
    'beneficiaryType',
    'beneficiaryDate',
    'status',
  ];
  filterControl: UntypedFormControl = new UntypedFormControl('');

  sortingCallbacks = {
    status: (a: GdxMsdfHousingResponse, b: GdxMsdfHousingResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  actions: IMenuItem<GdxMsdfHousingResponse>[] = [];
}
