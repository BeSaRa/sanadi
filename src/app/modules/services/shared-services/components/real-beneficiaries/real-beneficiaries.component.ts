import {Component, Input} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl} from '@angular/forms';
import {ListModelComponent} from '@app/generics/ListModel-component';
import {RealBeneficiary} from '@models/real-beneficiary';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {ToastService} from '@services/toast.service';
import { ComponentType } from '@angular/cdk/portal';
import { ReadBenefucuariesPopupComponent } from './read-benefucuaries-popup/read-benefucuaries-popup.component';
import { Nationalities } from '@app/enums/nationalities.enum';

@Component({
  selector: 'real-beneficiaries',
  templateUrl: './real-beneficiaries.component.html',
  styleUrls: ['./real-beneficiaries.component.scss'],
})
export class RealBeneficiariesComponent extends ListModelComponent<RealBeneficiary> {
  protected _getPopupComponent(): ComponentType<any> {
    return ReadBenefucuariesPopupComponent;
  }
  @Input() readonly!: boolean;
  filterControl: UntypedFormControl = new UntypedFormControl('');

  @Input() set list(_list: RealBeneficiary[]) {
    this._list = _list;
  }
  QATARI_NATIONALITY = Nationalities.QATARI;
  get list() {
    return this._list;
  }

  constructor(
    public lang: LangService,
    private fb: UntypedFormBuilder,
    private lookupService: LookupService,
    private toast: ToastService
  ) {
    super(RealBeneficiary);
  }

  columns = [
    'arabicName',
    'englishName',
    'birthDate',
    'birthLocation',
    'actions',
  ];

  protected _initComponent(): void {
    this.form = this.fb.group(this.model.buildForm());
    this.form.get('lastUpdateDate')?.disable();
  }

  _beforeAdd(row: RealBeneficiary): RealBeneficiary | null {
    const natinoality = this.lookupService.listByCategory.Nationality.find(e => e.lookupKey === row.nationality);
    const field = (natinoality?.lookupKey === this.QATARI_NATIONALITY) ? 'identificationNumber' : 'passportNumber';
    if (this._list.findIndex((e) => e[field] === row[field]) !== -1 && (this.editRecordIndex === -1)) {
      this.toast.alert(this.lang.map.msg_duplicated_item);
      return null;
    }
    return row;
  }
}
