import {Component, Input} from '@angular/core';
import {GdxParcelInfo} from '@app/models/gdx-parcel-info';
import {LangService} from '@services/lang.service';
import {UntypedFormControl} from '@angular/forms';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';

@Component({
  selector: 'moj-parcel-list',
  templateUrl: './moj-parcel-list.component.html',
  styleUrls: ['./moj-parcel-list.component.scss']
})
export class MojParcelListComponent {
  @Input() list: GdxParcelInfo[] = [];

  constructor(public lang: LangService) {

  }

  headerColumn: string[] = ['extra-header'];
  displayedColumns: string[] = ['parcelNo', 'parcelType', 'ownerName', 'city', 'zone', 'sharesCount'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  sortingCallbacks = {};
  actions: IMenuItem<GdxParcelInfo>[] = [];

}
