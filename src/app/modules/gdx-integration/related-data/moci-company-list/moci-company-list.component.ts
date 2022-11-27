import {Component, Input} from '@angular/core';
import {LangService} from '@services/lang.service';
import {UntypedFormControl} from '@angular/forms';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {GdxMociResponse} from '@app/models/gdx-moci-response';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';

@Component({
  selector: 'moci-company-list',
  templateUrl: './moci-company-list.component.html',
  styleUrls: ['./moci-company-list.component.scss']
})
export class MociCompanyListComponent {
  @Input() list: GdxMociResponse[] = [];

  constructor(public lang: LangService) {
  }

  headerColumn: string[] = ['extra-header'];
  displayedColumns: string[] = ['companyName', 'licenceNumber', 'companyStatus', 'relation', 'relationStatus'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  sortingCallbacks = {
    companyName: (a: GdxMociResponse, b: GdxMociResponse, dir: SortEvent): number => {
      const value1 = !CommonUtils.isValidValue(a) ? '' : a.primaryEstablishmentName.toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.primaryEstablishmentName.toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    licenceNumber: (a: GdxMociResponse, b: GdxMociResponse, dir: SortEvent): number => {
      const value1 = !CommonUtils.isValidValue(a) ? '' : a.commerciallicenseNumber.toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.commerciallicenseNumber.toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    companyStatus: (a: GdxMociResponse, b: GdxMociResponse, dir: SortEvent): number => {
      const value1 = !CommonUtils.isValidValue(a) ? '' : a.crnStatus.toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.crnStatus.toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    relation: (a: GdxMociResponse, b: GdxMociResponse, dir: SortEvent): number => {
      const value1 = !CommonUtils.isValidValue(a) ? '' : a.ownerType.toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.ownerType.toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    relationStatus: (a: GdxMociResponse, b: GdxMociResponse, dir: SortEvent): number => {
      const value1 = !CommonUtils.isValidValue(a) ? '' : a.ownerStatus.toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.ownerStatus.toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  };
  actions: IMenuItem<GdxMociResponse>[] = [];
}
