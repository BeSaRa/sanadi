import { Component, Input, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { GdxFlatInfo } from '@app/models/gdx-flat-info';
import { GdxMoiAddress } from '@app/models/gdx-moi-address';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { PaginatorComponent } from '@app/shared/components/paginator/paginator.component';

@Component({
    selector: 'moi-address-info',
    templateUrl: 'moi-address-info.component.html',
    styleUrls: ['moi-address-info.component.scss']
})
export class MoiAddressInfoComponent {
  @Input() list: GdxMoiAddress[] = [];

  constructor(public lang: LangService) {
  }

  headerColumn: string[] = ['extra-header'];

  displayedColumns: string[] = ['qidNum','addressDesc', 'buildingNum', 'email',
  'mobileNum', 'postBoxNum',  'streetNameAr', 'streetNameEn',
  'streetNum','telephoneNum','unitNum','zoneNum'];
  filterControl: UntypedFormControl = new UntypedFormControl('');


  actions: IMenuItem<GdxMoiAddress>[] = [];
}
