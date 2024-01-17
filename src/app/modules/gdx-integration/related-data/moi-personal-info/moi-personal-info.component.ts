import { Component, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { GdxFlatInfo } from '@app/models/gdx-flat-info';
import { GdxMoiPersonal } from '@app/models/gdx-moi-personal';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'moi-personal-info',
  templateUrl: 'moi-personal-info.component.html',
  styleUrls: ['moi-personal-info.component.scss']
})
export class MoiPersonalInfoComponent {
  @Input() list: GdxMoiPersonal[] = [];

  constructor(public lang: LangService) {
  }

  headerColumn: string[] = ['extra-header'];
  displayedColumns: string[] = ['qidNum', 'arbName1', 'arbName2', 'arbName3', 'arbName4', 'arbName5',
    'engName1', 'engName2', 'engName3', 'engName4', 'engName5', 'birthDateStr',
    'idCardExpiryDate', 'natCodeTextAR', 'natCodeTextEN', 'sex'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  sortingCallbacks = {};
  actions: IMenuItem<GdxMoiPersonal>[] = [];
}
