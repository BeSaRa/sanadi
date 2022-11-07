import {Component, OnInit, Inject} from '@angular/core';
import {FormBuilder, UntypedFormGroup} from '@angular/forms';
import {ControlWrapper} from '@contracts/i-control-wrapper';
import {FinalExternalOfficeApprovalResult} from '@app/models/final-external-office-approval-result';
import {CountryService} from '@services/country.service';
import {LangService} from '@services/lang.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Country} from '@app/models/country';

@Component({
  selector: 'external-offices-popup',
  templateUrl: './external-offices-popup.component.html',
  styleUrls: ['./external-offices-popup.component.scss'],
})
export class ExternalOfficesPopupComponent implements OnInit {
  readonly = true;
  controls: ControlWrapper[] = [
    {
      controlName: 'country',
      label: this.lang.map.country,
      type: 'dropdown',
      load$: this.countryService.loadAsLookups(),
      dropdownValue: 'id',
      dropdownOptionDisabled: (optionItem: Country) => {
        return !optionItem.isActive();
      }
    },
    {controlName: 'region', label: this.lang.map.region, type: 'text'},
    {
      controlName: 'recordNo',
      label: this.lang.map.record_number,
      type: 'text',
    },
    {controlName: 'fax', label: this.lang.map.fax_number, type: 'text'},
    {controlName: 'email', label: this.lang.map.lbl_email, type: 'text'},
    {
      controlName: 'postalCode',
      label: this.lang.map.postal_code,
      type: 'text',
    },
    {controlName: 'phone', label: this.lang.map.lbl_phone, type: 'text'},
  ];
  form!: UntypedFormGroup;

  constructor(public lang: LangService, private fb: FormBuilder, private countryService: CountryService,
              @Inject(DIALOG_DATA_TOKEN) public data: FinalExternalOfficeApprovalResult
  ) {
    console.log(data);
  }

  ngOnInit(): void {
    this.form = this.fb.group(this.data.buildForm());
    this.form.disable();
  }

  cancel() {
  }
}
