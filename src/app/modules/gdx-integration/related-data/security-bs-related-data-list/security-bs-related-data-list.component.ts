import {Component, Input} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {LangService} from '@app/services/lang.service';
import {GdxMsdfSecurityResponse} from '@app/models/gdx-msdf-security';
import {SortEvent} from "@contracts/sort-event";
import {CommonUtils} from "@helpers/common-utils";

@Component({
  selector: 'security-bs-related-data-list',
  templateUrl: './security-bs-related-data-list.component.html',
  styleUrls: ['./security-bs-related-data-list.component.scss']
})
export class SecurityBSRelatedDataListComponent {
  @Input() list: GdxMsdfSecurityResponse[] = [];

  constructor(public lang: LangService) {
  }

  headerColumn: string[] = ['extra-header'];

  displayedColumns: string[] = [
    'status'
  ];
  filterControl: UntypedFormControl = new UntypedFormControl('');

  sortingCallbacks = {
    status: (a: GdxMsdfSecurityResponse, b: GdxMsdfSecurityResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  actions: IMenuItem<GdxMsdfSecurityResponse>[] = [];
}
