import {Component, Input} from '@angular/core';
import {LangService} from '@services/lang.service';
import {GdxFlatInfo} from '@app/models/gdx-flat-info';
import {UntypedFormControl} from '@angular/forms';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';

@Component({
  selector: 'moj-flat-list',
  templateUrl: './moj-flat-list.component.html',
  styleUrls: ['./moj-flat-list.component.scss']
})
export class MojFlatListComponent {
  @Input() list: GdxFlatInfo[] = [];

  constructor(public lang: LangService) {
  }

  headerColumn: string[] = ['extra-header'];
  displayedColumns: string[] = ['transactionNo', 'transactionType', 'ownerName', 'contractDate', 'ownerShares'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  sortingCallbacks = {};
  actions: IMenuItem<GdxFlatInfo>[] = [];
}
