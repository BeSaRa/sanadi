import {GdxMsdfHousingResponse} from '@app/models/gdx-msdf-housing';
import {Component, Input} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {LangService} from '@app/services/lang.service';

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
    'statusString',
  ];
  filterControl: UntypedFormControl = new UntypedFormControl('');

  actions: IMenuItem<GdxMsdfHousingResponse>[] = [];
}
